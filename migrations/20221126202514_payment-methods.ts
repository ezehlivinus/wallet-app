import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return await knex.schema.createTable('paymentMethods', (table) => {
    table.increments('id');
    table.string('authorizationCode', 50).nullable();
    table.json('card').nullable(); /*
    This must store the card's
    - Last4: '0456'
    - exp_month: '12'
    - exp_year: '2050'
    - type: 'visa'
    - brand: 'visa'
    - account_name
    - customer_code: 'CUS_i5yosncbl8h2kvc'

    */
    table.string('recipientCode', 255).nullable();
    table.json('bank').nullable(); /*
    This must store the customer's bank's details
    {
      "authorization_code": null,
      "account_number": "0001234567",
      "account_name": null,
      "bank_code": "058",
      "bank_name": "Guaranty Trust Bank"
    }
    */
    table.integer('customer').references('id').inTable('users').unsigned();
    table.timestamps(true, true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return await knex.schema.dropTable('paymentMethods');
}
