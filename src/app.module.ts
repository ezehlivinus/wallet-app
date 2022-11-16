import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { KnexModule } from 'nest-knexjs';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig]
    }),

    KnexModule.forRootAsync({
      inject: [ConfigService],

      useFactory: (config: ConfigService) => ({
        config: config.get('database.config')
      })
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
