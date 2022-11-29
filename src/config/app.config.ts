import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  envName: process.env.NODE_ENV,
  apiPrefix: 'api',
  port: parseInt(process.env.APP_PORT || process.env.PORT, 10) || 3000,
  payments: {
    email: process.env.PAYMENTS_EMAIL,
    paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
    paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY
  }
}));
