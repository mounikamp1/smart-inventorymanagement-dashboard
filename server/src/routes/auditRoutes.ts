import { Router } from "express";
import { getAuditLogs } from "../controllers/auditController";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

// ADMIN only - audit logs are sensitive
router.get("/", authenticate, requireRole(["ADMIN"]), getAuditLogs);

export default router;