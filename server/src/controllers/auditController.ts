import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth";
import logger from "../lib/logger";

// Feature 14: Audit Log API - returns paginated audit log entries (ADMIN only)
export const getAuditLogs = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const model = req.query.model as string | undefined;
    const userId = req.query.userId as string | undefined;

    const where: any = {};
    if (model) where.model = model;
    if (userId) where.userId = userId;

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.auditLog.count({ where }),
    ]);

    res.json({
      data: logs,
      total,
      page,
      pages: Math.ceil(total / limit),
      hasNextPage: skip + limit < total,
    });
  } catch (error) {
    logger.error("Error fetching audit logs", error);
    res.status(500).json({ message: "Error fetching audit logs" });
  }
};