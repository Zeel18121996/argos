import { Column, CreatedAt, DataType, Model, UpdatedAt } from 'sequelize-typescript'
import { v4 as uuidv4 } from 'uuid'

/**
 * All Sequelize models MUST extend BaseModel.
 * Provides: id (UUID), createdAt, updatedAt.
 *
 * Each extending model must add the @Table() decorator.
 *
 * @example
 * @Table({ tableName: 'users' })
 * export class UserModel extends BaseModel {
 *   @Column(DataType.STRING)
 *   email: string
 * }
 */
export abstract class BaseModel extends Model {
  @Column({
    type: DataType.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true,
    allowNull: false,
  })
  declare id: string

  @CreatedAt
  @Column({ field: 'created_at' })
  declare createdAt: Date

  @UpdatedAt
  @Column({ field: 'updated_at' })
  declare updatedAt: Date
}
