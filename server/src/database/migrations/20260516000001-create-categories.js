'use strict'

/**
 * Categories table.
 *
 * Self-referential adjacency-list tree (parent_id → categories.id).
 * Soft-delete via is_active.
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('categories', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      slug: { type: Sequelize.STRING(200), allowNull: false, unique: true },
      name: { type: Sequelize.STRING(200), allowNull: false },
      parent_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      depth: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      image_url: { type: Sequelize.STRING(500), allowNull: true },
      sort_order: { type: Sequelize.INTEGER, allowNull: false, defaultValue: 0 },
      is_active: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    await queryInterface.addIndex('categories', ['parent_id'], { name: 'idx_categories_parent_id' })
    await queryInterface.addIndex('categories', ['is_active'], { name: 'idx_categories_is_active' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('categories')
  },
}
