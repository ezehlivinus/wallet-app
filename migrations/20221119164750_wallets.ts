import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('wallets', (table) => {
    table.increments('id');
    table.string('address', 255).unique().notNullable();
    table.double('balance').notNullable().defaultTo(0.0).unsigned();
    table.timestamps(true, true, true);
    table.integer('owner').index().references('id').inTable('users').unsigned();
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('wallets');
}
