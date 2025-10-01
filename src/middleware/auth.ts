import { Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Role, UserRole } from "@/models/Role";
import { User } from "@/models/User";
import { AuthRequest } from "@/interfaces/auth";

dotenv.config();

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Since the token comes as "Bearer <token>"

  if (token == null) return res.sendStatus(401);

  try {
    // TODO: change by using AWS Cognito
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      userId: number;
      role: UserRole;
    };

    const user = await User.findByPk(decoded.userId, { include: [Role] });

    if (!user) {
      return res.sendStatus(403);
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Error verifying token:", error);
    return res.sendStatus(403);
  }
};

export const authorizeRole = (requiredRoles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (
      !req.user ||
      !req.user.role ||
      !requiredRoles.includes(req.user.role.name)
    ) {
      return res.sendStatus(403);
    }
    next();
  };
};
