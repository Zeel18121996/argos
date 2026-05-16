'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('orders', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      order_number: {
        type: Sequelize.STRING(40),
        allowNull: false,
        unique: true,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: true,
        references: { model: 'users', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      guest_email: {
        type: Sequelize.STRING(320),
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      subtotal: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      delivery_cost: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      discount_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      payment_intent_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      payment_status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'pending',
      },
      delivery_method: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      delivery_address: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: {},
      },
      tracking_number: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    })

    await queryInterface.addIndex('orders', ['user_id'])
    await queryInterface.addIndex('orders', ['order_number'])
    await queryInterface.addIndex('orders', ['status'])
    await queryInterface.addIndex('orders', ['created_at'])
  },

  async down(queryInterface) {
    await queryInterface.dropTable('orders')
  },
}
