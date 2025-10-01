import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { CreationAttributes } from "sequelize";
import { Role } from "@/models/Role";
import { User } from "@/models/User";
import { createAuditLog } from "@/middleware/audit";

dotenv.config();

// TODO: change by using AWS Cognito
const JWT_SECRET = process.env.JWT_SECRET;

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const user = await User.findOne({ where: { username }, include: [Role] });

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generar JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role.name },
      JWT_SECRET as string,
      { expiresIn: "1h" }
    );

    await createAuditLog(user.id, "user_logged_in", "User");
    res.status(200).json({
      token,
      user: { id: user.id, username: user.username, role: user.role.name },
    });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Login failed", error });
  }
};

export const register = async (req: Request, res: Response) => {
  const { username, password, roleName } = req.body;

  if (!username || !password || !roleName) {
    return res
      .status(400)
      .json({ message: "Username, password, and roleName are required" });
  }

  try {
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists" });
    }

    const role = await Role.findOne({ where: { name: roleName } });
    if (!role) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      username,
      password: hashedPassword,
      roleId: role.id,
    } as CreationAttributes<User>);

    await createAuditLog(user.id, "user_registered", "User", user.id);
    res.status(201).json({
      message: "User registered successfully",
      user: { id: user.id, username: user.username, role: role.name },
    });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Registration failed", error });
  }
};
