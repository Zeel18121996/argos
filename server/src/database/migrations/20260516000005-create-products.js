'use strict'

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('products', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING(220),
        allowNull: false,
        unique: true,
      },
      sku: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
      },
      name: {
        type: Sequelize.STRING(300),
        allowNull: false,
      },
      brand: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      category_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: { model: 'categories', key: 'id' },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'price in pence/cents',
      },
      compare_at_price: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'original price for sale display',
      },
      stock_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      rating_average: {
        type: Sequelize.DECIMAL(2, 1),
        allowNull: false,
        defaultValue: 0,
      },
      review_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      features: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      specifications: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      delivery_options: {
        type: Sequelize.JSONB,
        allowNull: true,
        defaultValue: [],
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      is_featured: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_on_offer: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_new: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      is_clearance: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      reserve_available: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
      updated_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    })

    // Indexes
    await queryInterface.addIndex('products', ['category_id'], { name: 'idx_products_category_id' })
    await queryInterface.addIndex('products', ['slug'], { name: 'idx_products_slug' })
    await queryInterface.addIndex('products', ['is_active'], { name: 'idx_products_is_active' })
    await queryInterface.addIndex('products', ['is_featured'], { name: 'idx_products_is_featured' })
    await queryInterface.addIndex('products', ['is_on_offer'], { name: 'idx_products_is_on_offer' })
    await queryInterface.addIndex('products', ['is_new'], { name: 'idx_products_is_new' })
    await queryInterface.addIndex('products', ['brand'], { name: 'idx_products_brand' })
    await queryInterface.addIndex('products', ['price'], { name: 'idx_products_price' })
    // Add tsvector column via raw SQL (Sequelize doesn't have a TSVECTOR type)
    await queryInterface.sequelize.query(`
      ALTER TABLE products ADD COLUMN search_vector tsvector;
    `)

    await queryInterface.addIndex('products', ['search_vector'], {
      name: 'idx_products_search_vector',
      using: 'GIN',
    })

    // Full-text trigger
    await queryInterface.sequelize.query(`
      CREATE OR REPLACE FUNCTION products_search_update() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
          setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'B') ||
          setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C');
        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER products_search_trigger
        BEFORE INSERT OR UPDATE ON products
        FOR EACH ROW
        EXECUTE FUNCTION products_search_update();
    `)
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      DROP TRIGGER IF EXISTS products_search_trigger ON products;
      DROP FUNCTION IF EXISTS products_search_update();
    `)
    await queryInterface.dropTable('products')
  },
}
