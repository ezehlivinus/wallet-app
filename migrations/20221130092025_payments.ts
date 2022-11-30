import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('payments', (table) => {
    table.increments('id');
    table.enum('type', ['fund', 'withdraw']);
    table.string('reference', 255).nullable();
    table.string('transferCode', 255).nullable();
    table.string('recipientCode', 50).nullable();
    table.string('channel', 50).nullable();
    table.double('amount').nullable().unsigned();
    table.integer('transactionId').nullable().unsigned();

    table
      .integer('paymentMethod')
      .references('id')
      .inTable('paymentMethods')
      .nullable()
      .unsigned()
      .comment('This payment method like fund or withdraw to/from wallets');

    table.integer('customer').references('id').inTable('users').unsigned();
    table.string('walletAddress').references('address').inTable('wallets');

    table.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('payments');
}
