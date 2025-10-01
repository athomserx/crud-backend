import { Response, NextFunction } from "express";
import { AuditLog } from "@/models/AuditLog";
import { AuthRequest } from "@/interfaces/auth";
import { CreationAttributes } from "sequelize";

export const auditMiddleware = (action: string, entityType: string) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    const entityId = req.params.id || req.body.id || null;

    if (req.user) {
      await AuditLog.create({
        userId: req.user.id,
        action: action,
        entityType: entityType,
        entityId: entityId,
        details: {
          method: req.method,
          path: req.originalUrl,
          body: req.body,
          params: req.params,
        },
      } as CreationAttributes<AuditLog>);
    }
    next();
  };
};

/**
 * Auxiliary function to trigger the creation of an audit log
 */
export const createAuditLog = async (
  userId: number,
  action: string,
  entityType: string,
  entityId?: number | null,
  details?: object
) => {
  await AuditLog.create({
    userId,
    action,
    entityType,
    entityId: entityId || null,
    details: details || {},
  } as CreationAttributes<AuditLog>);
};
