import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id');
    table.enum('type', ['credit', 'debit']);
    table.string('purpose', 255).nullable();
    table.double('amount').notNullable().unsigned();
    table
      .double('walletBalance')
      .nullable()
      .unsigned()
      .comment('This is this users wallet balance for this transaction');
    table.timestamps(true, true, true);
    table.string('from').references('address').inTable('wallets');
    table.string('to').references('address').inTable('wallets');
    table.string('reference', 50).notNullable();
    table
      .integer('customer')
      .index()
      .references('id')
      .inTable('users')
      .unsigned();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}
