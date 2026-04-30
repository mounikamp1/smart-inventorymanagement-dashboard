import { Queue, Worker } from "bullmq";
import nodemailer from "nodemailer";
import prisma from "../lib/prisma";
import logger from "../lib/logger";

const connection = {
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: Number(process.env.REDIS_PORT) || 6379,
  enableOfflineQueue: false,
  maxRetriesPerRequest: null,
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "sandbox.smtp.mailtrap.io",
  port: Number(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

let lowStockQueue: Queue | null = null;
let lowStockWorker: Worker | null = null;

function initBullMQ() {
  try {
    lowStockQueue = new Queue("low-stock-report", { connection });
    lowStockQueue.on("error", (err) =>
      logger.warn("BullMQ Queue error (Redis unavailable)", { err: err.message })
    );

    lowStockWorker = new Worker(
      "low-stock-report",
      async (job) => {
        logger.info(`Processing low stock report job #${job.id}`);
        const LOW_STOCK_THRESHOLD = Number(process.env.LOW_STOCK_THRESHOLD) || 10;

        const lowStockProducts = await prisma.products.findMany({
          where: { stockQuantity: { lte: LOW_STOCK_THRESHOLD } },
          orderBy: { stockQuantity: "asc" },
        });

        if (lowStockProducts.length === 0) {
          logger.info("No low stock products found, skipping email");
          return { skipped: true };
        }

        const productList = lowStockProducts
          .map((p) => `  - ${p.name}: ${p.stockQuantity} units remaining`)
          .join("\n");

        await transporter.sendMail({
          from: process.env.SMTP_FROM || "inventory@company.com",
          to: process.env.ALERT_EMAIL || "admin@company.com",
          subject: `[Inventory Alert] ${lowStockProducts.length} Low Stock Product(s) - ${new Date().toLocaleDateString()}`,
          text: `Hello,\n\nThe following products are running low on stock:\n\n${productList}\n\nPlease reorder as soon as possible.\n\n-- Smart Inventory System`,
          html: `<h2>Low Stock Alert</h2><ul>${lowStockProducts.map((p) => `<li><strong>${p.name}</strong>: ${p.stockQuantity} units</li>`).join("")}</ul>`,
        });

        logger.info(`Low stock alert sent for ${lowStockProducts.length} product(s)`);
        return { count: lowStockProducts.length };
      },
      { connection }
    );

    lowStockWorker.on("error", (err) =>
      logger.warn("BullMQ Worker error (Redis unavailable)", { err: err.message })
    );
    lowStockWorker.on("completed", (job, result) =>
      logger.info(`Low stock job ${job.id} completed`, result)
    );
    lowStockWorker.on("failed", (job, err) =>
      logger.error(`Low stock job ${job?.id} failed`, { err: err.message })
    );
  } catch (err: any) {
    logger.warn("BullMQ init failed (Redis unavailable) — background jobs disabled", { err: err.message });
  }
}

initBullMQ();

export const scheduleLowStockReport = async () => {
  if (!lowStockQueue) {
    logger.warn("BullMQ queue not available — skipping schedule (Redis not running)");
    return;
  }
  try {
    await lowStockQueue.add(
      "nightly-report",
      {},
      {
        repeat: { pattern: "0 2 * * *" },
        removeOnComplete: { count: 10 },
        removeOnFail: { count: 5 },
      }
    );
    logger.info("Nightly low stock report scheduled (02:00 daily)");
  } catch (err: any) {
    logger.warn("Failed to schedule low stock job (Redis unavailable)", { err: err.message });
  }
};
