import {
  Table,
  Column,
  DataType,
  HasMany,
  BelongsTo,
  ForeignKey,
  AllowNull,
  Default,
  Unique,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'

@Table({ tableName: 'categories', underscored: true })
export class CategoryModel extends BaseModel {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare slug: string

  @AllowNull(false)
  @Column(DataType.STRING)
  declare name: string

  @ForeignKey(() => CategoryModel)
  @AllowNull(true)
  @Column({ field: 'parent_id', type: DataType.UUID })
  declare parentId: string | null

  @BelongsTo(() => CategoryModel, { foreignKey: 'parentId', as: 'parent' })
  declare parent: CategoryModel | null

  @HasMany(() => CategoryModel, { foreignKey: 'parentId', as: 'children' })
  declare children: CategoryModel[]

  @Default(0)
  @Column(DataType.INTEGER)
  declare depth: number

  @AllowNull(true)
  @Column({ field: 'image_url', type: DataType.STRING })
  declare imageUrl: string | null

  @Default(0)
  @Column({ field: 'sort_order', type: DataType.INTEGER })
  declare sortOrder: number

  @Default(true)
  @Column({ field: 'is_active', type: DataType.BOOLEAN })
  declare isActive: boolean
}
