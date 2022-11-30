import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('payments', (table) => {
    table.increments('id');
    table.enum('type', ['fund', 'withdraw']);
    table.string('reference', 255).nullable();
    table.string('transfer_code', 255).nullable();
    table.string('channel', 50).nullable();
    table.double('amount').nullable().unsigned();
    table.integer('transactionId').nullable().unsigned();
    table.timestamps(true, true, true);
    table.integer('customer').references('id').inTable('users').unsigned();
    table.string('walletAddress').references('address').inTable('wallets');
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('payments');
}
