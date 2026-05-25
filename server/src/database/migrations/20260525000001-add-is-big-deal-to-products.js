'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'is_big_deal', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    })

    await queryInterface.addIndex('products', ['is_big_deal'], {
      name: 'idx_products_is_big_deal',
    })
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('products', 'idx_products_is_big_deal')
    await queryInterface.removeColumn('products', 'is_big_deal')
  },
}
