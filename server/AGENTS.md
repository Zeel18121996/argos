# ArgosC – Server Rules (NestJS Backend)

> These rules apply when working inside `server/`. They extend and take precedence over the root `WARP.md`.

---

## Skill Reference

Before implementing any backend feature, read `.warp/skills/backend.md`.
Before creating or modifying entities/migrations, read `.warp/skills/database.md`.
Before implementing any guard, role check, or admin endpoint, read `.warp/skills/access-control.md`.

---

## Project Setup

- **Framework**: NestJS 10 (`nest-cli.json` at root of `server/`)
- **Entry point**: `src/main.ts`
- **Global prefix**: `/api/v1`
- **Port**: `4000`
- **Tests**: `npm run test` (unit) · `npm run test:e2e` (end-to-end)
- **Lint**: `npm run lint` (ESLint + `@typescript-eslint`)
- **Type check**: `npm run build` (tsc)
- **Migrations**: `npm run migration:generate`, `npm run migration:run`

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

- Apply `@UseGuards(JwtAuthGuard, RolesGuard)` at **class level** (not per-method) so new routes are secured by default.
- Mark public routes explicitly with `@Public()` decorator — opt-in to public access, not opt-out.
- Admin-only routes get `@Roles('admin')`.

### Response codes

- `200` — default GET/PATCH/PUT
- `201` — POST (use `@HttpCode(HttpStatus.CREATED)`)
- `204` — DELETE (use `@HttpCode(HttpStatus.NO_CONTENT)`, return `void`)
- Never return `201` for GET or `200` for DELETE.

---

## Service Rules

### Error handling

```typescript
// Always throw typed NestJS exceptions — never throw raw Error
if (!entity) throw new NotFoundException(`${EntityName} #${id} not found`)
if (conflict) throw new ConflictException('Email already in use')
if (forbidden) throw new ForbiddenException('You cannot modify this resource')
```

### Transactions

Use TypeORM `QueryRunner` for any operation touching multiple tables:

```typescript
const queryRunner = this.dataSource.createQueryRunner()
await queryRunner.connect()
await queryRunner.startTransaction()
try {
  // ...operations
  await queryRunner.commitTransaction()
} catch (err) {
  await queryRunner.rollbackTransaction()
  throw err
} finally {
  await queryRunner.release()
}
```

### No direct DB calls in controllers

Controllers call service methods only. Services own all DB interaction.

---

## DTO Rules

- Use `PartialType` from `@nestjs/mapped-types` for update DTOs:
  ```typescript
  // update-product.dto.ts
  import { PartialType } from '@nestjs/mapped-types'
  import { CreateProductDto } from './create-product.dto'
  export class UpdateProductDto extends PartialType(CreateProductDto) {}
  ```
- Every DTO property needs at least one `class-validator` decorator.
- Query DTOs that accept page/limit must always have:

  ```typescript
  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100)
  limit?: number = 30;
  ```

- Do **not** use `@IsOptional()` on required fields.

---

## Model Rules (Sequelize)

- All models extend `BaseModel` from `src/database/base.model.ts` (UUID `id`, `createdAt`, `updatedAt`).
- Every model class needs `@Table({ tableName: 'snake_case_plural', underscored: true })`.
- Register in feature module: `SequelizeModule.forFeature([MyModel])` — **never** in `AppModule`.
- Inject as: `@InjectModel(MyModel) private myModel: typeof MyModel`
- All price columns: `DataType.INTEGER` (pence). Never `DECIMAL`/`FLOAT` for money.
- JSON columns: `DataType.JSONB` (never `DataType.JSON`).
- Soft delete: `Model.update({ isActive: false }, { where: { id } })`. Never call `.destroy()` on products/categories/users/orders.
- Always use `declare` on model properties.
- Always specify `as:` alias on associations.
- Foreign keys: declare with `@ForeignKey(() => ParentModel)` + `@Column({ field: 'parent_id', type: DataType.UUID })`.

---

## Auth & Security Rules

- Passwords hashed with **bcrypt**, min 12 rounds (`bcrypt.hash(password, 12)`).
- Access token TTL: **15 minutes**. Refresh token TTL: **7 days**.
- Refresh tokens stored as bcrypt hash in `refresh_tokens` table. Never store plain tokens.
- CORS allowed origin: `process.env.CLIENT_URL` only. No wildcards in production.
- Rate limits: login → 5 req/min per IP. Register → 10 req/min per IP.
- All cookie options: `httpOnly: true`, `sameSite: 'lax'`, `secure: true` (production only).

---

## Database / Migration Rules (Sequelize CLI)

- `synchronize: true` is enabled **only in development** (via `AppModule`). Never in production.
- Generate migration: `npm run migration:generate -- DescriptiveName` → fills `src/database/migrations/`.
- Run: `npm run migration:run` | Revert: `npm run migration:revert`.
- Every migration **must** have a working `down()` method.
- Never edit an already-applied migration — create a new one.
- Seeds live in `src/database/seeders/`. Run with `npm run seed:run`.
- Migration files are plain `.js` (not `.ts`) — sequelize-cli generates JS by default.

---

## Testing Rules

### Unit tests (`*.service.spec.ts`)

- Mock the TypeORM repository with `createMock<Repository<Entity>>()` from `@golevelup/ts-jest`.
- Test every service method: success case + all failure cases (NotFoundException, ConflictException, etc.).
- Aim for **100% branch coverage** on service methods.

### E2E tests (`test/*.e2e-spec.ts`)

- Use an in-memory or Docker test database — never run e2e tests against the dev database.
- Seed minimal required data in `beforeEach` / `beforeAll`, clean up in `afterEach`.
- Test the full HTTP request → response cycle including auth headers.

---

## Logging

- Use NestJS's built-in `Logger` (not `console.log`):
  ```typescript
  private readonly logger = new Logger(ProductsService.name);
  this.logger.log(`Creating product: ${dto.name}`);
  this.logger.error(`Failed to find product ${id}`, error.stack);
  ```
- Log at `log` level for normal operations, `warn` for recoverable issues, `error` for exceptions.
- Never log sensitive data (passwords, tokens, full card numbers).

---

## Access Control Rules

Roles: `customer` | `staff` | `admin`. Read `.warp/skills/access-control.md` for the full spec.

### Guard stack — always apply both

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)  // at class level
```

### Role decorator quick reference

| Decorator                        | Who can access                     |
| -------------------------------- | ---------------------------------- |
| `@Public()`                      | Everyone including unauthenticated |
| _(no decorator, no `@Public()`)_ | Any authenticated user (customer+) |
| `@Roles('staff')`                | Staff and admin (hierarchy-based)  |
| `@Roles('admin')`                | Admin only                         |

### AdminModule

- All `/api/v1/admin/*` endpoints live in `src/admin/admin.module.ts`.
- The `AdminModule` imports `UsersModule`, `OrdersModule`, etc. as needed.
- Every admin endpoint must have `@Roles('staff')` at minimum; user management endpoints require `@Roles('admin')`.
- Add `@Audit('ACTION_NAME', 'EntityType')` decorator on every state-changing admin endpoint so changes are logged to `admin_audit_log`.

### Audit logging

- `AuditInterceptor` automatically captures `before`/`after` snapshots for `@Audit()`-decorated endpoints.
- Never manually write to `admin_audit_log` — always go through the interceptor.
- Audit log entries are immutable — no UPDATE or DELETE on `admin_audit_log` ever.

### Role changes

- Only `PATCH /api/v1/admin/users/:id/role` can change a user's role — `@Roles('admin')` required.
- When a user's role changes, call `refreshTokensService.revokeAllForUser(userId)` to invalidate existing sessions.

---

## Environment Variables

All env vars must be:

1. Declared in `.env.example` with a placeholder value and a comment.
2. Validated in `src/config/env.validation.ts` using Joi.
3. Accessed only via `ConfigService` — never via `process.env` directly in service/controller code.

```typescript
// env.validation.ts
export const envValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  REDIS_URL: Joi.string().uri().required(),
  JWT_ACCESS_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),
  STRIPE_SECRET_KEY: Joi.string().required(),
  CLIENT_URL: Joi.string().uri().required(),
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
})
```
