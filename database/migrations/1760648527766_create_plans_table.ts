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
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}