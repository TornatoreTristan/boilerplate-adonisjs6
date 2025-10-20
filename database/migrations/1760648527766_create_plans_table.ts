import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'plans'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))

      table.string('name').notNullable()
      table.string('slug').notNullable().unique()
      table.text('description').nullable()

      table.string('stripe_product_id').nullable().unique()
      table.string('stripe_price_id_monthly').nullable()
      table.string('stripe_price_id_yearly').nullable()

      table.decimal('price_monthly', 10, 2).notNullable().defaultTo(0)
      table.decimal('price_yearly', 10, 2).notNullable().defaultTo(0)
      table.string('currency', 3).notNullable().defaultTo('EUR')

      table
        .enum('pricing_model', ['flat', 'per_seat', 'tiered', 'volume'])
        .notNullable()
        .defaultTo('flat')
      table.jsonb('pricing_tiers').nullable()

      table.integer('trial_days').nullable()

      table.jsonb('features').nullable()
      table.jsonb('limits').nullable()

      table.boolean('is_active').notNullable().defaultTo(true)
      table.boolean('is_visible').notNullable().defaultTo(true)
      table.integer('sort_order').notNullable().defaultTo(0)

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })

    // Add Full-Text Search support
    this.schema.raw(`
      ALTER TABLE ${this.tableName} ADD COLUMN search_vector tsvector;

      CREATE INDEX ${this.tableName}_search_idx ON ${this.tableName} USING GIN(search_vector);

      CREATE OR REPLACE FUNCTION ${this.tableName}_search_trigger() RETURNS trigger AS $$
      BEGIN
        NEW.search_vector :=
          setweight(to_tsvector('french', COALESCE(NEW.name, '')), 'A') ||
          setweight(to_tsvector('french', COALESCE(NEW.slug, '')), 'B') ||
          setweight(to_tsvector('french', COALESCE(NEW.description, '')), 'C') ||
          setweight(to_tsvector('french', COALESCE(NEW.features::text, '')), 'D');
        RETURN NEW;
      END
      $$ LANGUAGE plpgsql;

      CREATE TRIGGER ${this.tableName}_search_update
      BEFORE INSERT OR UPDATE ON ${this.tableName}
      FOR EACH ROW EXECUTE FUNCTION ${this.tableName}_search_trigger();

      -- Populate existing data
      UPDATE ${this.tableName} SET search_vector =
        setweight(to_tsvector('french', COALESCE(name, '')), 'A') ||
        setweight(to_tsvector('french', COALESCE(slug, '')), 'B') ||
        setweight(to_tsvector('french', COALESCE(description, '')), 'C') ||
        setweight(to_tsvector('french', COALESCE(features::text, '')), 'D');
    `)
  }

  async down() {
    this.schema.raw(`
      DROP TRIGGER IF EXISTS ${this.tableName}_search_update ON ${this.tableName};
      DROP FUNCTION IF EXISTS ${this.tableName}_search_trigger();
      DROP INDEX IF EXISTS ${this.tableName}_search_idx;
    `)
    this.schema.dropTable(this.tableName)
  }
}