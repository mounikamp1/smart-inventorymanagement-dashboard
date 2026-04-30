import { PrismaClient } from "@prisma/client";
import logger from "./logger";

// Base client used for audit log writes (avoids circular extension calls)
const baseClient = new PrismaClient();

// Feature 5: Audit Logging via Prisma $extends
export const prisma = baseClient.$extends({
  query: {
    products: {
      async create({ args, query }) {
        const userId = (args.data as any)?._auditUserId ?? "system";
        // Remove BEFORE query (unknown fields cause Prisma 500)
        if ((args.data as any)?._auditUserId) delete (args.data as any)._auditUserId;
        const result = await query(args);
        baseClient.auditLog
          .create({
            data: {
              userId,
              action: "create",
              model: "Products",
              recordId: String((result as any).productId ?? "unknown"),
              newData: result as any,
            },
          })
          .catch((err: Error) => logger.error("Audit log failed", { err: err.message }));
        return result;
      },
      async update({ args, query }) {
        const oldData = await baseClient.products.findUnique({ where: args.where as any }).catch(() => null);
        const userId = (args.data as any)?._auditUserId ?? "system";
        // Remove BEFORE query (unknown fields cause Prisma 500)
        if ((args.data as any)?._auditUserId) delete (args.data as any)._auditUserId;
        const result = await query(args);
        baseClient.auditLog
          .create({
            data: {
              userId,
              action: "update",
              model: "Products",
              recordId: String((result as any).productId ?? "unknown"),
              oldData: oldData as any,
              newData: result as any,
            },
          })
          .catch((err: Error) => logger.error("Audit log failed", { err: err.message }));
        return result;
      },
      async delete({ args, query }) {
        const oldData = await baseClient.products.findUnique({ where: args.where as any }).catch(() => null);
        const result = await query(args);
        baseClient.auditLog
          .create({
            data: {
              userId: "system",
              action: "delete",
              model: "Products",
              recordId: String((oldData as any)?.productId ?? "unknown"),
              oldData: oldData as any,
            },
          })
          .catch((err: Error) => logger.error("Audit log failed", { err: err.message }));
        return result;
      },
    },
  },
}) as unknown as PrismaClient;

export default prisma;