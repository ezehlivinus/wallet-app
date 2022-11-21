import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('users', (table) => {
    table.increments('id');
    table.string('email', 255).unique().notNullable();
    table.string('password', 255).notNullable();
    table.enum('role', ['admin', 'user']).defaultTo('user').notNullable();
    table.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('users');
}
