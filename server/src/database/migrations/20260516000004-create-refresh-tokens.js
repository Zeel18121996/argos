'use strict'

/**
 * Refresh tokens.
 *
 * One row per active refresh-token session per user.
 * On login → insert. On refresh → rotate (revoke old + insert new).
 * On logout → revoke row (revoked=true).
 *
 * token_hash stores SHA-256(raw token) — never the raw token itself.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('refresh_tokens', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      token_hash: { type: Sequelize.STRING(64), allowNull: false, unique: true },
      expires_at: { type: Sequelize.DATE, allowNull: false },
      revoked: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      replaced_by_id: { type: Sequelize.UUID, allowNull: true },
      user_agent: { type: Sequelize.STRING(255), allowNull: true },
      ip_address: { type: Sequelize.STRING(64), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    await queryInterface.addIndex('refresh_tokens', ['user_id'], {
      name: 'idx_refresh_tokens_user_id',
    })
    await queryInterface.addIndex('refresh_tokens', ['token_hash'], {
      name: 'idx_refresh_tokens_token_hash_unique',
      unique: true,
    })
    await queryInterface.addIndex('refresh_tokens', ['expires_at'], {
      name: 'idx_refresh_tokens_expires_at',
    })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('refresh_tokens')
  },
}
