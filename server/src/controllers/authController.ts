import { Request, Response } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const RegisterSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "STAFF"]).default("STAFF"),
});

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    const { email, password } = parsed.data;
    const user = await prisma.users.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      res.status(401).json({ message: "Invalid email or password" });
      return;
    }
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );
    res.json({
      token,
      user: { userId: user.userId, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    logger.error("Login error", error);
    res.status(500).json({ message: "Login failed" });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ message: "Validation error", errors: parsed.error.flatten() });
      return;
    }
    const { email, name, password, role } = parsed.data;
    const exists = await prisma.users.findUnique({ where: { email } });
    if (exists) {
      res.status(409).json({ message: "Email already registered" });
      return;
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.users.create({
      data: { userId: uuidv4(), name, email, password: hashed, role },
    });
    const token = jwt.sign(
      { userId: user.userId, email: user.email, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "8h" }
    );
    res.status(201).json({
      token,
      user: { userId: user.userId, name: user.name, email: user.email, role: user.role },
    });
  } catch (error) {
    logger.error("Register error", error);
    res.status(500).json({ message: "Registration failed" });
  }
};
