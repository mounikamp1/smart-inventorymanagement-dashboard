import { z } from "zod";

export const CreateProductSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required").max(200),
  price: z.number().positive("Price must be positive"),
  rating: z.number().min(0).max(5).optional(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  imageUrl: z.string().url().optional().nullable(),
});

export const UpdateStockSchema = z.object({
  stockQuantity: z.number().int().min(0),
});

export const PaginationSchema = z.object({
  cursor: z.string().optional(),
  take: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export type CreateProductInput = z.infer<typeof CreateProductSchema>;
export type UpdateStockInput = z.infer<typeof UpdateStockSchema>;
export type PaginationInput = z.infer<typeof PaginationSchema>;
