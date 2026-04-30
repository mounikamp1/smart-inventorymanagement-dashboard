import { Request, Response } from "express";
import prisma from "../lib/prisma";
import redis from "../lib/redis";
import logger from "../lib/logger";

const DASHBOARD_CACHE_KEY = "dashboard:metrics";
const CACHE_TTL = 300; // 5 minutes

// Feature 3: Redis Caching for expensive analytics
export const getDashboardMetrics = async (req: Request, res: Response): Promise<void> => {
  try {
    const cached = await redis.get(DASHBOARD_CACHE_KEY).catch(() => null);
    if (cached) {
      res.set("X-Cache", "HIT");
      res.json(JSON.parse(cached));
      return;
    }

    const [popularProducts, salesSummary, purchaseSummary, expenseSummary, expenseByCategorySummaryRaw] =
      await Promise.all([
        prisma.products.findMany({ take: 15, orderBy: { stockQuantity: "desc" } }),
        prisma.salesSummary.findMany({ take: 5, orderBy: { date: "desc" } }),
        prisma.purchaseSummary.findMany({ take: 5, orderBy: { date: "desc" } }),
        prisma.expenseSummary.findMany({ take: 5, orderBy: { date: "desc" } }),
        prisma.expenseByCategory.findMany({ take: 5, orderBy: { date: "desc" } }),
      ]);

    const expenseByCategorySummary = expenseByCategorySummaryRaw.map((item: any) => ({
      ...item,
      amount: item.amount.toString(),
    }));

    const result = { popularProducts, salesSummary, purchaseSummary, expenseSummary, expenseByCategorySummary };
    await redis.setex(DASHBOARD_CACHE_KEY, CACHE_TTL, JSON.stringify(result)).catch(() => null);
    res.set("X-Cache", "MISS");
    res.json(result);
  } catch (error) {
    logger.error("Error retrieving dashboard metrics", error);
    res.status(500).json({ message: "Error retrieving dashboard metrics" });
  }
};
