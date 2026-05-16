# Skill: Argos Clone - Database (Sequelize + PostgreSQL)

## When to use this skill

Read this before creating or modifying models, migrations, or seed data.

---

## ORM Stack

- **sequelize** `^6.x` - core ORM
- **sequelize-typescript** `^2.x` - TypeScript decorators
- **@nestjs/sequelize** `^10.x` - NestJS integration
- **sequelize-cli** `^6.x` - migrations and seeds
- **pg** - Postgres driver

---

## NestJS Module Registration

```typescript
// In each feature module
@Module({
  imports: [SequelizeModule.forFeature([UserModel])],
})
export class UsersModule {}
```

---

## BaseModel

All models MUST extend BaseModel from src/database/base.model.ts.

```typescript
import { BaseModel } from '../../database/base.model'
```

Provides: id (UUID, auto-generated), createdAt, updatedAt.

---

## Model Patterns

```typescript
// users/models/user.model.ts
import {
  Table,
  Column,
  DataType,
  Unique,
  HasMany,
  AllowNull,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'
import { BaseModel } from '../../database/base.model'

@Table({ tableName: 'users', underscored: true })
export class UserModel extends BaseModel {
  @Unique
  @AllowNull(false)
  @Column(DataType.STRING)
  declare email: string

  @AllowNull(false)
  @Column({ field: 'password_hash', type: DataType.STRING })
  declare passwordHash: string

  @Default('customer')
  @Column(DataType.STRING)
  declare role: 'customer' | 'staff' | 'admin'

  @HasMany(() => OrderModel, { foreignKey: 'userId' })
  declare orders: OrderModel[]
}
```

### Associations

```typescript
// One-to-many (parent side)
@HasMany(() => OrderItemModel, { foreignKey: 'orderId', as: 'items' })
declare items: OrderItemModel[]

// Many-to-one (child side)
@ForeignKey(() => OrderModel)
@Column({ field: 'order_id', type: DataType.UUID })
declare orderId: string

@BelongsTo(() => OrderModel, { foreignKey: 'orderId', as: 'order' })
declare order: OrderModel
```

### Common column types

```typescript
@Column(DataType.STRING)                          // VARCHAR(255)
@Column(DataType.TEXT)                            // TEXT
@Column(DataType.INTEGER)                         // INT - use for pence/prices
@Column(DataType.BOOLEAN)
@Column(DataType.DATE)
@Column(DataType.JSONB)                           // use JSONB not JSON
@Column(DataType.ENUM('a', 'b', 'c'))

// Explicit snake_case field name
@Column({ field: 'base_price', type: DataType.INTEGER })
declare basePrice: number
```

---

## Service Query Patterns

### Inject model

```typescript
@Injectable()
export class UsersService {
  constructor(@InjectModel(UserModel) private userModel: typeof UserModel) {}
}
```

### Common queries

```typescript
// Find all with filters + pagination
const { count, rows } = await this.productModel.findAndCountAll({
  where: { isActive: true },
  order: [['created_at', 'DESC']],
  limit,
  offset: (page - 1) * limit,
})

// Find one by PK
const user = await this.userModel.findByPk(id)
if (!user) throw new NotFoundException(`User ${id} not found`)

// Find with eager-loaded associations
const order = await this.orderModel.findByPk(id, {
  include: [
    { model: OrderItemModel, as: 'items' },
    { model: UserModel, as: 'user', attributes: ['id', 'email', 'firstName'] },
  ],
})

// Create
const user = await this.userModel.create({ email, passwordHash, role: 'customer' })

// Update
await this.userModel.update({ firstName }, { where: { id } })

// Soft delete (preferred)
await this.productModel.update({ isActive: false }, { where: { id } })

// Where operators
import { Op } from 'sequelize'
where: {
  basePrice: { [Op.between]: [minPrice, maxPrice] },
  brand:     { [Op.in]: brands },
  name:      { [Op.iLike]: `%${query}%` },
}
```

### Transactions

```typescript
constructor(@InjectConnection() private sequelize: Sequelize) {}

const t = await this.sequelize.transaction()
try {
  const order = await this.orderModel.create({ ...dto }, { transaction: t })
  await this.orderItemModel.bulkCreate(items, { transaction: t })
  await t.commit()
  return order
} catch (err) {
  await t.rollback()
  throw err
}
```

---

## Migrations (sequelize-cli)

```bash
npm run migration:generate -- AddUsersTable  # creates empty migration
npm run migration:run                         # apply all pending
npm run migration:revert                      # undo last
npm run seed:run                              # run all seeders
```

### Migration template

```javascript
// src/database/migrations/YYYYMMDDHHMMSS-create-users.js
'use strict'
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: { type: Sequelize.STRING, allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING, allowNull: false },
      role: { type: Sequelize.STRING, defaultValue: 'customer', allowNull: false },
      created_at: { type: Sequelize.DATE, allowNull: false },
      updated_at: { type: Sequelize.DATE, allowNull: false },
    })
  },
  async down(queryInterface) {
    await queryInterface.dropTable('users')
  },
}
```

---

## Seeders

```javascript
// src/database/seeders/YYYYMMDDHHMMSS-categories.js
'use strict'
const { v4: uuidv4 } = require('uuid')
module.exports = {
  async up(queryInterface) {
    const now = new Date()
    await queryInterface.bulkInsert(
      'categories',
      [
        {
          id: uuidv4(),
          slug: 'technology',
          name: 'Technology',
          depth: 0,
          sort_order: 1,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
        {
          id: uuidv4(),
          slug: 'home-and-garden',
          name: 'Home & Garden',
          depth: 0,
          sort_order: 2,
          is_active: true,
          created_at: now,
          updated_at: now,
        },
      ],
      {},
    )
  },
  async down(queryInterface) {
    await queryInterface.bulkDelete('categories', null, {})
  },
}
```

---

## Important Conventions

- **Prices** are INTEGER pence. £9.99 = 999. Never DECIMAL/FLOAT for money.
- **Column names** in DB are snake_case. Use `field:` in @Column or enable `underscored: true`.
- **Soft delete**: set is_active = false. Never call .destroy() on products/categories/users/orders.
- **JSON columns**: always DataType.JSONB, never DataType.JSON.
- **synchronize: true** is only for development. Production always uses migrations.
- Use `declare` keyword on all model properties for TS compatibility.
- Always specify `as:` on associations for clarity in include queries.
