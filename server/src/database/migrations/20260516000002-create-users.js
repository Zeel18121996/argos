'use strict'

/**
 * Users table.
 *
 * Role: 'customer' | 'staff' | 'admin' (varchar + CHECK, easier to evolve than enum).
 * is_active=false → user cannot log in (soft-deactivated by admin).
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      email: { type: Sequelize.STRING(320), allowNull: false, unique: true },
      password_hash: { type: Sequelize.STRING(255), allowNull: false },
      first_name: { type: Sequelize.STRING(80), allowNull: false },
      last_name: { type: Sequelize.STRING(80), allowNull: false },
      phone: { type: Sequelize.STRING(40), allowNull: true },
      role: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'customer',
      },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      email_verified: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      marketing_opt_in: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      password_reset_token: { type: Sequelize.STRING(255), allowNull: true },
      password_reset_expires: { type: Sequelize.DATE, allowNull: true },
      last_login_at: { type: Sequelize.DATE, allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // CHECK constraint for role values
    await queryInterface.sequelize.query(
      `ALTER TABLE users ADD CONSTRAINT users_role_check
       CHECK (role IN ('customer', 'staff', 'admin'))`,
    )

    // Indexes
    await queryInterface.addIndex('users', ['email'], {
      name: 'idx_users_email_unique',
      unique: true,
    })
    await queryInterface.addIndex('users', ['role'], { name: 'idx_users_role' })
    await queryInterface.addIndex('users', ['is_active'], { name: 'idx_users_is_active' })
    await queryInterface.addIndex('users', ['password_reset_token'], {
      name: 'idx_users_password_reset_token',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('users')
  },
}
