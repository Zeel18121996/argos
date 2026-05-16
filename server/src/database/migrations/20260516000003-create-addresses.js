'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('addresses', {
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
      is_default: { type: Sequelize.BOOLEAN, allowNull: false, defaultValue: false },
      first_name: { type: Sequelize.STRING(80), allowNull: false },
      last_name: { type: Sequelize.STRING(80), allowNull: false },
      line1: { type: Sequelize.STRING(200), allowNull: false },
      line2: { type: Sequelize.STRING(200), allowNull: true },
      city: { type: Sequelize.STRING(100), allowNull: false },
      postcode: { type: Sequelize.STRING(20), allowNull: false },
      country: { type: Sequelize.STRING(2), allowNull: false, defaultValue: 'GB' },
      phone: { type: Sequelize.STRING(40), allowNull: true },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    await queryInterface.addIndex('addresses', ['user_id'], { name: 'idx_addresses_user_id' })
    await queryInterface.addIndex('addresses', ['postcode'], { name: 'idx_addresses_postcode' })
  },

  async down(queryInterface) {
    await queryInterface.dropTable('addresses')
  },
}
