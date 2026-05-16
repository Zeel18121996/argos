'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('product_variants', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'products', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING(200),
        allowNull: false,
      },
      attributes: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
        comment: 'e.g. { color: "Red", size: "L" }',
      },
      price_override: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      stock_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    await queryInterface.addIndex('product_variants', ['product_id'], { name: 'idx_product_variants_product_id' })
    await queryInterface.addIndex('product_variants', ['sku'], { unique: true, name: 'idx_product_variants_sku' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('product_variants')
  },
}
