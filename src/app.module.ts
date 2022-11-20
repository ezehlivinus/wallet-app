import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import appConfig from './config/app.config';
import { AuthModule } from './auth/auth.module';
import { WalletsModule } from './wallets/wallets.module';
import jwtConfig from './config/jwt.config';
import databaseConfig from './config/database.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, databaseConfig, jwtConfig]
    }),

    KnexModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        config: config.get('database.config')
      })
    }),

    UsersModule,
    AuthModule,
    WalletsModule
  ],
  controllers: [AppController],
  providers: []
})
export class AppModule {}
