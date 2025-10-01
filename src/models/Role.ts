import { Table, Column, Model, DataType, HasMany } from "sequelize-typescript";
import { User } from "./User";

export enum UserRole {
  ADMIN = "admin",
  OPERATOR = "operator",
  VIEWER = "viewer",
}

@Table({
  tableName: "roles",
  timestamps: false,
})
export class Role extends Model<Role> {
  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    allowNull: false,
    unique: true,
  })
  name!: UserRole;

  @HasMany(() => User)
  users!: User[];
}
