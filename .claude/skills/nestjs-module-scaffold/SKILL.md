---
name: nestjs-module-scaffold
description: Scaffold a complete NestJS module for the ArgosC server — controller, service, DTOs (create/update/query), Sequelize entity, and matching unit-spec stubs. Use whenever the user asks to "add a module", "create a new resource", "add an endpoint group", or "scaffold a CRUD" anywhere under server/src/.
---

# Skill: nestjs-module-scaffold

Generates a NestJS module that conforms to the ArgosC backend conventions in [`server/CLAUDE.md`](../../../server/CLAUDE.md).

## Inputs needed from the user

Ask only what is missing:

1. **Resource name** (singular, e.g. `product`, `inventory-item`).
2. **Fields** on the entity: `name:string`, `price:int_pence`, `stock:int`, `isActive:bool`, `categoryId:uuid`, …
3. Whether it is **admin-only** (yes → routes under `/api/v1/admin/{resources}`, `@Roles('staff')` minimum; no → `/api/v1/{resources}`, customer-accessible read endpoints).
4. **Soft-delete required?** (defaults yes — projects/users/orders/categories always soft delete).

## Files to produce

Inside `server/src/{module-name}/`:

```
{module}.module.ts
{module}.controller.ts
{module}.controller.spec.ts
{module}.service.ts
{module}.service.spec.ts
dto/
  create-{entity}.dto.ts
  update-{entity}.dto.ts        ← extends PartialType(CreateDto)
  query-{entity}.dto.ts         ← page (default 1), limit (default 30, max 100), filters
entities/
  {entity}.entity.ts            ← extends BaseModel
```

Then append the module import to `server/src/app.module.ts`.

## Template rules (must follow)

- **Controller**: `@UseGuards(JwtAuthGuard, RolesGuard)` at class level. Public read routes get `@Public()`. Admin routes get `@Roles('staff')` or `@Roles('admin')`.
- **Service**: throws `NotFoundException` / `ConflictException` — never raw `Error`. No `console.log` — use `Logger`.
- **Entity**: `extends BaseModel` (UUID id, createdAt, updatedAt). `@Table({ tableName: 'snake_case_plural', underscored: true })`. Money columns `DataType.INTEGER`. JSON columns `DataType.JSONB`. All properties use `declare`.
- **DTOs**: every field has a `class-validator` decorator. `UpdateDto extends PartialType(CreateDto)`. Query DTO includes the standard `page`/`limit` block.
- **Spec stubs**: one `describe` per service method with `success` + every typed-exception path. Use `getModelToken(Entity)` to mock the model.

## After scaffolding

1. Generate the migration via the `sequelize-migration` skill.
2. Run `npm run lint` + `npm run build` in `server/` and fix any errors before reporting done.
3. Suggest the matching `client/src/services/{resource}Api.ts` — but only create it if the user confirms.
