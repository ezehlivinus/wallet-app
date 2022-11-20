import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id');
    table.enum('type', ['credit', 'debit']);
    table.string('purpose', 255).nullable();
    table.double('amount').notNullable().unsigned();
    table.timestamps(true, true, true);
    table.string('from').references('address').inTable('wallets');
    table.string('to').references('address').inTable('wallets');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
