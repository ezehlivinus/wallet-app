import { registerAs } from '@nestjs/config';

export default registerAs('payments', () => ({
  email: process.env.PAYMENTS_EMAIL,
  paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
  paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY
}));
