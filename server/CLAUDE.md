# ArgosC — Server (NestJS Backend) Claude Instructions

> Rules for work inside `server/`. Extends and overrides the root [`CLAUDE.md`](../CLAUDE.md).

---

## Project Setup

- **Framework**: NestJS 10 (`nest-cli.json` at the root of `server/`)
- **Entry point**: `src/main.ts`
- **Global prefix**: `/api/v1`
- **Port**: `4000`
- **Tests**: `npm run test` (unit) · `npm run test:e2e` (end-to-end)
- **Lint**: `npm run lint` (ESLint + `@typescript-eslint`)
- **Type check**: `npm run build` (tsc)
- **Migrations**: `npm run migration:generate`, `npm run migration:run`, `npm run migration:revert`
- **Seeds**: `npm run seed:run`

---

## Module Creation Checklist

When adding a new NestJS module, always create **all** of these files:

```
src/{module}/
  {module}.module.ts
  {module}.controller.ts
  {module}.controller.spec.ts
  {module}.service.ts
  {module}.service.spec.ts
  dto/
    create-{entity}.dto.ts
    update-{entity}.dto.ts     ← use PartialType(CreateDto)
    query-{entity}.dto.ts      ← pagination + filters
  entities/
    {entity}.entity.ts
```

Then register the module in `src/app.module.ts`.

> Trigger the [`nestjs-module-scaffold`](../.claude/skills/nestjs-module-scaffold/SKILL.md) skill to generate this layout automatically.

---

## Controller Rules

### Route naming

| Action               | Method | Path                     |
| -------------------- | ------ | ------------------------ |
| List                 | GET    | `/{resources}`           |
| Get one              | GET    | `/{resources}/:id`       |
| Create               | POST   | `/{resources}`           |
| Full update          | PUT    | `/{resources}/:id`       |
| Partial update       | PATCH  | `/{resources}/:id`       |
| Delete               | DELETE | `/{resources}/:id`       |
| Nested resource list | GET    | `/{resources}/:id/{sub}` |

### Guards & access

- Apply `@UseGuards(JwtAuthGuard, RolesGuard)` at **class level** so new routes are secured by default.
- Mark public routes explicitly with `@Public()` — opt-in to public access, not opt-out.
- Admin-only routes get `@Roles('admin')`.

### Response codes

- `200` — GET / PATCH / PUT (default)
- `201` — POST (`@HttpCode(HttpStatus.CREATED)`)
- `204` — DELETE (`@HttpCode(HttpStatus.NO_CONTENT)`, return `void`)
- Never `201` for GET or `200` for DELETE.

---

## Service Rules

### Error handling — always throw typed Nest exceptions

```typescript
if (!entity) throw new NotFoundException(`${EntityName} #${id} not found`)
if (conflict) throw new ConflictException('Email already in use')
if (forbidden) throw new ForbiddenException('You cannot modify this resource')
```

Never throw raw `Error`.

### Transactions

Use Sequelize `transaction()` for any operation touching multiple tables:

```typescript
await this.sequelize.transaction(async (t) => {
  await this.ordersModel.create(orderData, { transaction: t })
  await this.basketModel.destroy({ where: { userId }, transaction: t })
})
```

### Layering

Controllers call services only. Services own all DB and external-API interaction. No direct repository access from controllers.

---

## DTO Rules

- Use `PartialType` from `@nestjs/mapped-types` for update DTOs:

```typescript
// update-product.dto.ts
import { PartialType } from '@nestjs/mapped-types'
import { CreateProductDto } from './create-product.dto'
export class UpdateProductDto extends PartialType(CreateProductDto) {}
```

- Every DTO property gets at least one `class-validator` decorator.
- Query DTOs that accept page/limit must include:

```typescript
@IsOptional() @Type(() => Number) @IsInt() @Min(1)
page?: number = 1;

@IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
limit?: number = 30;
```

- Never `@IsOptional()` on a required field.

---

## Sequelize Model Rules

- All models extend `BaseModel` from `src/database/base.model.ts` (UUID `id`, `createdAt`, `updatedAt`).
- Every model class needs `@Table({ tableName: 'snake_case_plural', underscored: true })`.
- Register per-feature: `SequelizeModule.forFeature([MyModel])` — **never** in `AppModule`.
- Inject as: `@InjectModel(MyModel) private myModel: typeof MyModel`.
- **Money columns** = `DataType.INTEGER` (pence). Never `DECIMAL`/`FLOAT`.
- **JSON columns** = `DataType.JSONB` (never `DataType.JSON`).
- **Soft delete**: `Model.update({ isActive: false }, { where: { id } })`. Never `.destroy()` on products/categories/users/orders.
- Always use `declare` on model properties.
- Always specify `as:` alias on associations.
- Foreign keys: `@ForeignKey(() => ParentModel)` + `@Column({ field: 'parent_id', type: DataType.UUID })`.

---

## Auth & Security

- Passwords: **bcrypt**, min 12 rounds (`bcrypt.hash(password, 12)`).
- Access token TTL: **15 min**. Refresh token TTL: **7 days**.
- Refresh tokens stored as **bcrypt hash** in `refresh_tokens` table. Never plain.
- CORS allowed origin: `process.env.CLIENT_URL` only. No wildcards in production.
- Rate limits: login → 5 req/min/IP. Register → 10 req/min/IP.
- Cookie options: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (production only).

---

## Database / Migrations (Sequelize CLI)

- `synchronize: true` is **dev only** (via `AppModule`). Never in production.
- Generate: `npm run migration:generate -- DescriptiveName` → `src/database/migrations/`.
- Run: `npm run migration:run` · Revert: `npm run migration:revert`.
- Every migration **must** have a working `down()` method.
- **Never edit an already-applied migration** — create a new one.
- Seeds: `src/database/seeders/`, run via `npm run seed:run`.
- Migration files are plain `.js` (not `.ts`) — sequelize-cli generates JS by default.

> For schema changes, trigger the [`sequelize-migration`](../.claude/skills/sequelize-migration/SKILL.md) skill.

---

## Payments (simulated)

- All checkout flows go through `src/payments/simulated-processor.service.ts`.
- Test card `4000000000000002` always returns `DECLINED`. Any other 16-digit number returns `APPROVED`.
- Never import a real payment SDK. See [`../PAYMENTS.md`](../PAYMENTS.md) for the full contract.
- Before touching the checkout flow, spawn the [`payment-tester`](../.claude/agents/payment-tester.md) subagent.

---

## Testing

### Unit (`*.service.spec.ts`)

- Mock the Sequelize model with `getModelToken(MyModel)` + Nest testing module.
- Cover every method: success + every failure path (NotFound, Conflict, Forbidden, …).
- Aim for **100% branch coverage** on services.

### E2E (`test/*.e2e-spec.ts`)

- Hit an **isolated test database** — never the dev DB.
- Seed minimal data in `beforeEach` / `beforeAll`, clean in `afterEach`.
- Test the full HTTP cycle including auth headers.

---

## Logging

```typescript
private readonly logger = new Logger(ProductsService.name);
this.logger.log(`Creating product: ${dto.name}`);
this.logger.error(`Failed to find product ${id}`, error.stack);
```

- `log` for normal ops, `warn` for recoverable issues, `error` for exceptions.
- Never log passwords, tokens, or full card numbers.

---

## Admin Module & Audit

- All `/api/v1/admin/*` endpoints live in `src/admin/admin.module.ts`.
- `AdminModule` imports `UsersModule`, `OrdersModule`, etc.
- Every admin endpoint: `@Roles('staff')` minimum; user-management: `@Roles('admin')`.
- Add `@Audit('ACTION_NAME', 'EntityType')` on every state-changing admin endpoint.
- `AuditInterceptor` writes to `admin_audit_log`. **Never manually write** to that table.
- `admin_audit_log` is append-only — no UPDATE/DELETE ever.
- Role changes only via `PATCH /api/v1/admin/users/:id/role` (`@Roles('admin')`). On change, call `refreshTokensService.revokeAllForUser(userId)`.

---

## Environment Variables

All env vars must be:

1. Declared in `.env.example` with a placeholder and a comment.
2. Validated in `src/config/env.validation.ts` (Joi schema).
3. Accessed via `ConfigService` only — never `process.env` directly in services/controllers.

```typescript
export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  CLIENT_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
})
```

---

## When to invoke Claude tools

- New module → trigger the `nestjs-module-scaffold` skill.
- Schema change / new migration → trigger the `sequelize-migration` skill.
- Touching checkout → spawn [`payment-tester`](../.claude/agents/payment-tester.md).
- New endpoint → spawn [`api-contract-checker`](../.claude/agents/api-contract-checker.md) before merge.
- New admin route → spawn [`access-control-auditor`](../.claude/agents/access-control-auditor.md).
