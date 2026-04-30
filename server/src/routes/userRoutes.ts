import { Router } from "express";
import { getUsers, getMe, updateMe } from "../controllers/userController";
import { authenticate, requireRole } from "../middleware/auth";

const router = Router();

router.get("/me", authenticate, getMe);
router.patch("/me", authenticate, updateMe);
router.get("/", authenticate, requireRole(["ADMIN"]), getUsers);

export default router;