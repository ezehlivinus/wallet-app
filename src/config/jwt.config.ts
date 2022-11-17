import { registerAs } from '@nestjs/config';

export default registerAs('jwt', () => ({
  options: {
    issuer: 'wallet-app',
    audience: 'wallet-app',
    subject: 'wallet-app:user',
    expiresIn: '6h',
    algorithm: 'HS512'
  },
  secret: process.env.JWT_SECRET
}));
