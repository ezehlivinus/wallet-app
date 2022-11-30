import * as dotenv from 'dotenv';

dotenv.config();

// Update with your config settings.
/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
  development: {
    client: 'mysql2',
    version: '8',
    useNullAsDefault: true,
    connection: {
      // host: '127.0.0.1',
      // user: 'root',
      // password: 'root',
      // database: 'nest'
      host: process.env.MYSQLHOST,
      user: process.env.MYSQLUSER,
      password: process.env.MYSQLPASSWORD,
      database: process.env.MYSQLDATABASE
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'mysql2',
    connection: process.env.MYSQL_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }
};
