import { registerAs } from '@nestjs/config';

export default registerAs('app', () => {
  const PORT = parseInt(process.env.APP_PORT || process.env.PORT, 10) || 3000;

  return {
    envName: process.env.NODE_ENV,
    apiPrefix: 'api',
    port: PORT,
    appURL:
      process.env.NODE_ENV === 'production'
        ? process.env.APP_URL + '/api'
        : `http://localhost:${PORT}/api`,
    payments: {
      email: process.env.PAYMENTS_EMAIL,
      paystackSecretKey: process.env.PAYSTACK_SECRET_KEY,
      paystackPublicKey: process.env.PAYSTACK_PUBLIC_KEY
    }
  };
});
