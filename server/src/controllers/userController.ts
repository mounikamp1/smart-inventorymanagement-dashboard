import { Response } from "express";
import { z } from "zod";
import { AuthRequest } from "../middleware/auth";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

export const getUsers = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.users.findMany({
      select: { userId: true, name: true, email: true, role: true },
    });
    res.json(users);
  } catch (error) {
    logger.error("Error retrieving users", error);
    res.status(500).json({ message: "Error retrieving users" });
  }
};

// Feature 16: Get current user profile
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }
    const user = await prisma.users.findUnique({
      where: { userId },
      select: { userId: true, name: true, email: true, role: true },
    });
    if (!user) { res.status(404).json({ message: "User not found" }); return; }
    res.json(user);
  } catch (error) {
    logger.error("Error getting current user", error);
    res.status(500).json({ message: "Error fetching user" });
  }
};

const UpdateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  email: z.string().email("Invalid email").optional(),
});

// Feature 16: Update current user profile (Settings persistence)
export const updateMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    const userId = req.user?.userId;
    if (!userId) { res.status(401).json({ message: "Unauthorized" }); return; }

    // Check email uniqueness if changing email
    if (parsed.data.email) {
      const existing = await prisma.users.findFirst({
        where: { email: parsed.data.email, NOT: { userId } },
      });
      if (existing) {
        res.status(409).json({ message: "Email already in use" });
        return;
      }
    }

    const updated = await prisma.users.update({
      where: { userId },
      data: parsed.data,
      select: { userId: true, name: true, email: true, role: true },
    });
    res.json(updated);
  } catch (error) {
    logger.error("Error updating user profile", error);
    res.status(500).json({ message: "Error updating profile" });
  }
};