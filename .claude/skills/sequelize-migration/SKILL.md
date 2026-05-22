---
name: sequelize-migration
description: Create a Sequelize migration in server/src/database/migrations/ following the ArgosC schema conventions. Use whenever the user asks to "add a column", "create a table", "add an index", "alter a foreign key", or change anything that affects the PostgreSQL schema. Always produces both up() and down().
---

# Skill: sequelize-migration

Generates a single migration file in `server/src/database/migrations/` and updates the matching Sequelize entity in `server/src/{module}/entities/`.

## Inputs needed

1. **Change description** — exactly what is changing (e.g. "add `delivery_slot_id` UUID FK to `orders`").
2. **Affected table(s)** in `snake_case_plural`.
3. **Affected entity file** in `server/src/{module}/entities/{entity}.entity.ts`.
4. Whether a **backfill seeder** is needed for existing rows.

## Workflow

1. Run `npm run migration:generate -- DescriptiveName` in `server/` (or write the file directly using the timestamped filename format `{YYYYMMDDHHMMSS}-descriptive-name.js`).
2. Fill in `up()`:
   - Tables created with `queryInterface.createTable(...)` include `id: UUID PK`, `created_at`, `updated_at`, and `is_active` (default `true`) for any soft-deletable resource.
   - Columns added with `queryInterface.addColumn(...)`. If the column is non-null, supply a `defaultValue` or add a separate backfill before changing nullability in a second migration.
   - Foreign keys: `references: { model: '{plural}', key: 'id' }`, `onUpdate: 'CASCADE'`, `onDelete: 'RESTRICT'` (or `SET NULL` if appropriate — never `CASCADE` for protected resources).
   - Indexes: name them explicitly with `queryInterface.addIndex(table, { fields, name })`.
3. Fill in `down()` as the **exact inverse** of `up()`. If `up` added column X, `down` drops column X. Read both side-by-side to verify.
4. Update the entity file:
   - Add the new property with `declare` and a matching `@Column` decorator.
   - For FKs, add `@ForeignKey(() => ParentModel)` plus `@BelongsTo(() => ParentModel, { as: '…' })`.
5. If a backfill is needed, create a separate file in `server/src/database/seeders/`. Do **not** mix data with structure inside the migration.
6. Run `npm run migration:run` then `npm run migration:revert` to verify both directions, then `migration:run` again to leave the DB in the migrated state.

## Hard rules

- **All primary keys are UUID.** Default value: `Sequelize.literal('uuid_generate_v4()')` or `DataType.UUIDV4`.
- **Money columns** = `INTEGER` (pence). Never `DECIMAL`/`FLOAT`.
- **JSON columns** = `JSONB`.
- **Never edit an already-applied migration.** Always a new one.
- **Migration files are `.js`** — sequelize-cli does not generate `.ts`.

## Output

Report back:

- Path of the migration file.
- Path of any seeder added.
- Path of the updated entity.
- Confirmation that `up()` ↔ `down()` are exact inverses.
- The exact `npm` commands used to verify the round-trip.
