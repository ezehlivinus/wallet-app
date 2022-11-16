import { registerAs } from '@nestjs/config';
import knexConfig from '../../knexfile'

export default registerAs('database', () => ({
  // url: process.env.DATABASE_URL,
  config: {
    ...knexConfig[process.env.NODE_ENV]
  }
}));