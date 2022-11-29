import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import { TransactionsModule } from './transactions/transactions.module';
import { PaymentsModule } from './payments/payments.module';
import jwtConfig from './config/jwt.config';
import databaseConfig from './config/database.config';
import paymentConfig from './config/payment.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig, paymentConfig]
    }),

    KnexModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        config: config.get('database.config')
      })
    }),

    UsersModule,
    AuthModule,
    WalletsModule,
    TransactionsModule,
    PaymentsModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
