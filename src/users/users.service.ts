import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateUserDto } from 'src/auth/auth.dto';
import { UserFindDto } from './users.dto';

@Injectable()
export class UsersService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async findById(id: number) {
    const user = await this.knex.table('users').where('id', id);

    if (!user.length) {
      return undefined;
    }

    return user[0];
  }

  async findByEmail(email: string) {
    const user = await this.knex.table('users').where('email', email);

    if (!user.length) {
      return undefined;
    }

    return user[0];
  }

  async findOne(filter: UserFindDto) {
    const user = await this.knex.table('users').where(filter);

    if (!user.length) {
      return undefined;
    }

    return user[0];
  }

  async create(createUserDto: CreateUserDto) {
    const result = await this.knex.table('users').insert({
      password: createUserDto.password,
      email: createUserDto.email
    });

    const user = await this.findOne({ email: createUserDto.email });

    return { user };
  }
}
