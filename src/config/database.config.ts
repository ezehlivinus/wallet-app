import { registerAs } from '@nestjs/config';
import knexConfig from '../../knexfile'

export default registerAs('database', () => ({
  // url: process.env.DATABASE_URL,
  config: {
    client: 'mysql',
    version: '8',
    useNullAsDefault: true,
    connection: {
      ...knexConfig.development
    }
  }
}));