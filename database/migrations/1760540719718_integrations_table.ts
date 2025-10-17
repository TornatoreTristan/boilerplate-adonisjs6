import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'integrations'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.uuid('id').primary().defaultTo(this.raw('gen_random_uuid()'))
      table.string('provider').notNullable().unique() // stripe, paypal, etc.
      table.boolean('is_active').defaultTo(false)
      table.jsonb('config').notNullable() // Encrypted config with API keys
      table.jsonb('metadata').nullable() // Additional non-sensitive data

      table.timestamp('created_at').notNullable()
      table.timestamp('updated_at').nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
