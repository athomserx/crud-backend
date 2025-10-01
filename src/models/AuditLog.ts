import {
  Table,
  Column,
  Model,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { User } from "./User";

@Table({
  tableName: "audit_logs",
  timestamps: true,
})
export class AuditLog extends Model<AuditLog> {
  @ForeignKey(() => User)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  userId!: number;

  @BelongsTo(() => User)
  user!: User;

  /**
   * Action performed by the user, e.g: 'product_created', 'product_updated', 'user_logged_in'
   */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  action!: string;

  @Column({
    type: DataType.JSONB,
    allowNull: true,
  })
  details!: object;

  /**
   * Entity type, e.g: 'Product', 'User'
   */
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  entityType!: string;

  /**
   * The ID of the entity that was affected
   */
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  entityId!: number;
}
