import { Request, Response } from "express";
import { z } from "zod";
import { v2 as cloudinary } from "cloudinary";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import redis from "../lib/redis";
import logger from "../lib/logger";
import { CreateProductSchema, PaginationSchema } from "../schemas/productSchema";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Feature 2: Cursor Pagination + Feature 3: Redis Cache
export const getProducts = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = PaginationSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ message: "Invalid query params", errors: parsed.error.flatten() });
      return;
    }
    const { cursor, take, search } = parsed.data;
    const cacheKey = `products:${search ?? ""}:cursor:${cursor ?? "start"}:take:${take}`;

    const cached = await redis.get(cacheKey).catch(() => null);
    if (cached) {
      res.json(JSON.parse(cached));
      return;
    }

    const products = await prisma.products.findMany({
      take: take + 1,
      ...(cursor ? { cursor: { productId: cursor }, skip: 1 } : {}),
      where: search ? { name: { contains: search, mode: "insensitive" } } : undefined,
      orderBy: { name: "asc" },
    });

    const hasNextPage = products.length > take;
    const data = hasNextPage ? products.slice(0, -1) : products;
    const nextCursor = hasNextPage ? data[data.length - 1].productId : null;

    const response = { data, nextCursor, hasNextPage };
    await redis.setex(cacheKey, 60, JSON.stringify(response)).catch(() => null);
    res.json(response);
  } catch (error) {
    logger.error("Error retrieving products", error);
    res.status(500).json({ message: "Error retrieving products" });
  }
};

// Feature 7: DB Transactions + Feature 8: Zod Validation
export const createProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = CreateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    const { productId, name, price, rating, stockQuantity, imageUrl } = parsed.data;

    const product = await prisma.$transaction(async (tx) => {
      return tx.products.create({
        data: {
          productId,
          name,
          price,
          rating,
          stockQuantity,
          imageUrl: imageUrl || null,
          _auditUserId: req.user?.userId ?? "system",
        } as any,
      });
    });

    const keys = await redis.keys("products:*").catch(() => [] as string[]);
    if (keys.length) await redis.del(...keys).catch(() => null);

    res.status(201).json(product);
  } catch (error) {
    logger.error("Error creating product", error);
    res.status(500).json({ message: "Error creating product" });
  }
};

const UpdateProductSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  price: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
});

// Feature 15: Update product (used by inventory optimistic UI)
export const updateProduct = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) { res.status(400).json({ message: "Product ID required" }); return; }

    const parsed = UpdateProductSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    if (Object.keys(parsed.data).length === 0) {
      res.status(400).json({ message: "No fields to update" });
      return;
    }

    const product = await prisma.products.update({
      where: { productId: id },
      data: { ...parsed.data, _auditUserId: req.user?.userId ?? "system" } as any,
    });

    const keys = await redis.keys("products:*").catch(() => [] as string[]);
    if (keys.length) await redis.del(...keys).catch(() => null);

    res.json(product);
  } catch (error: any) {
    if (error?.code === "P2025") {
      res.status(404).json({ message: "Product not found" });
      return;
    }
    logger.error("Error updating product", error);
    res.status(500).json({ message: "Error updating product" });
  }
};

// Feature 9: Cloudinary Image Upload
export const uploadProductImage = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: "inventory-products", resource_type: "image" },
        (error, uploadResult) => {
          if (error || !uploadResult) reject(error ?? new Error("Upload failed"));
          else resolve(uploadResult);
        }
      );
      stream.end(req.file!.buffer);
    });
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    logger.error("Image upload error", error);
    res.status(500).json({ message: "Image upload failed" });
  }
};