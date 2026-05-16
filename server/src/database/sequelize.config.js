/* eslint-disable @typescript-eslint/no-var-requires */
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../../../.env') })

/**
 * Sequelize CLI configuration.
 * Used by: sequelize-cli db:migrate, db:seed, etc.
 */
module.exports = {
  development: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: false,
    },
    migrationStorageTableName: 'sequelize_migrations',
    seederStorage: 'sequelize',
    seederStorageTableName: 'sequelize_seeds',
  },
  test: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    migrationStorageTableName: 'sequelize_migrations',
  },
  production: {
    url: process.env.DATABASE_URL,
    dialect: 'postgres',
    dialectOptions: {
      ssl: { rejectUnauthorized: false },
    },
    migrationStorageTableName: 'sequelize_migrations',
  },
}
