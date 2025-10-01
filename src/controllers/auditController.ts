import { Request, Response } from "express";
import { Op, WhereOptions } from "sequelize";
import { AuditLog } from "@/models/AuditLog";
import { User } from "@/models/User";
import { Role } from "@/models/Role";

export const getAuditLogs = async (req: Request, res: Response) => {
  const {
    userId,
    action,
    entityType,
    entityId,
    startDate,
    endDate,
    page = 1,
    limit = 10,
  } = req.query;

  const where: WhereOptions<AuditLog> = {};
  if (userId) {
    where.userId = Number(userId);
  }
  if (action) {
    where.action = action.toString();
  }
  if (entityType) {
    where.entityType = entityType.toString();
  }
  if (entityId) {
    where.entityId = Number(entityId);
  }
  if (startDate && endDate) {
    where.createdAt = {
      [Op.between]: [
        new Date(startDate.toString()),
        new Date(endDate.toString()),
      ],
    };
  }

  const offset = (Number(page) - 1) * Number(limit);

  try {
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "username"],
          include: [{ model: Role, attributes: ["name"] }],
        },
      ],
      limit: Number(limit),
      offset: offset,
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      totalItems: count,
      currentPage: Number(page),
      totalPages: Math.ceil(count / Number(limit)),
      auditLogs,
    });
  } catch (error) {
    console.error("Error fetching audit logs:", error);
    res.status(500).json({ message: "Error fetching audit logs", error });
  }
};
