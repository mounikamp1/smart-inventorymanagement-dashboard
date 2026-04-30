import { Router } from "express";
import { createProduct, getProducts, uploadProductImage, updateProduct } from "../controllers/productController";
import { authenticate, requireRole } from "../middleware/auth";
import { upload } from "../lib/multer";

const router = Router();

router.get("/", authenticate, getProducts);
router.post("/", authenticate, requireRole(["ADMIN"]), createProduct);
router.patch("/:id", authenticate, requireRole(["ADMIN"]), updateProduct);
router.post("/upload", authenticate, upload.single("image"), uploadProductImage);

export default router;