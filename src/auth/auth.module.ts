import { ConfigService } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { SignOptions } from 'jsonwebtoken';
import { JwtStrategy } from './auth.strategy';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('jwt.secret'),
        signOptions: config.get<SignOptions>('jwt.options')
      })
    })
  ],
  providers: [AuthService, JwtStrategy, UsersService],
  controllers: [AuthController]
})
export class AuthModule {}
