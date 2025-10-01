import { Router } from "express";
import { getAuditLogs } from "@/controllers/auditController";
import { authenticateToken, authorizeRole } from "@/middleware/auth";
import { UserRole } from "@/models/Role";

const router = Router();

// Only admin can view audit logs
router.get(
  "/",
  authenticateToken,
  authorizeRole([UserRole.ADMIN]),
  getAuditLogs
);

export default router;
