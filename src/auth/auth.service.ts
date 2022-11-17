import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDTO, CreateUserDto } from './auth.dto';
// import * as _ from 'lodash';
import { InjectConnection } from 'nest-knexjs';
import { Knex } from 'knex';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
    private configService: ConfigService,
    @InjectConnection() private readonly knex: Knex
  ) {}

  async validateUser(payload: { email: string }) {
    const user = await this.userService.findOne({ email: payload.email });

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
  async login(body: LoginDTO) {
    const { email, password } = body;

    const user = await this.userService.findOne({ email });

    if (!user) {
      throw new BadRequestException('Invalid email or password.');
    }

    const isMatch = await this.comparePassword(password, user.password);

    if (!isMatch) {
      throw new BadRequestException('Invalid email or password');
    }

    const accessToken = this.jwtService.sign({ email });

    delete user.password;
    return { data: user, accessToken };
  }

  async auth(body: CreateUserDto) {
    const { email, password } = body;

    const user = await this.userService.findByEmail(email);

    if (user) {
      throw new ConflictException('User already exists');
    }

    const hashPassword = await this.hashPassword(password);

    await this.userService.create({
      email,
      password: hashPassword
    });

    const newUser = await this.userService.findByEmail(email);

    const token = await this.jwtService.signAsync(
      {
        email,
        id: newUser.id
      },
      {
        expiresIn: '24h',
        algorithm: 'HS512',
        secret: this.configService.get('JWT_SECRET')
      }
    );

    delete newUser.password;

    return {
      data: newUser,
      access_token: token
    };
  }

  async hashPassword(password: string) {
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(password, saltOrRounds);
    return hash;
  }

  async comparePassword(password: string, userPassword: string) {
    console.log(password, userPassword);
    return await bcrypt.compare(password, userPassword);
  }
}
