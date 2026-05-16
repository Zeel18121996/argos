/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })

/**
 * Sequelize CLI configuration.
 * Used by: sequelize-cli db:migrate, db:seed, etc.
 */
const dbUrl = process.env.DATABASE_URL ||
  `postgres://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`

module.exports = {
  development: {
    url: dbUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
    migrationStorageTableName: 'sequelize_migrations',
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
  },
  test: {
    url: dbUrl,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
  },
  production: {
    url: dbUrl,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    migrationStorageTableName: 'sequelize_migrations',
  },
}
