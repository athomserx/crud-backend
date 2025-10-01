import { Router } from "express";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/controllers/productController";
import { authenticateToken, authorizeRole } from "@/middleware/auth";
import { UserRole } from "@/models/Role";
import { auditMiddleware } from "@/middleware/audit";

const router = Router();

router.post(
  "/",
  authenticateToken,
  authorizeRole([UserRole.ADMIN, UserRole.OPERATOR]),
  auditMiddleware("create_product_attempt", "Product"),
  createProduct
);
router.get(
  "/",
  authenticateToken,
  authorizeRole([UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER]),
  getProducts
);
router.get(
  "/:id",
  authenticateToken,
  authorizeRole([UserRole.ADMIN, UserRole.OPERATOR, UserRole.VIEWER]),
  getProductById
);
router.put(
  "/:id",
  authenticateToken,
  authorizeRole([UserRole.ADMIN, UserRole.OPERATOR]),
  auditMiddleware("update_product_attempt", "Product"),
  updateProduct
);
router.delete(
  "/:id",
  authenticateToken,
  authorizeRole([UserRole.ADMIN]),
  auditMiddleware("delete_product_attempt", "Product"),
  deleteProduct
);

export default router;
