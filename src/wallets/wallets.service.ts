import { Injectable } from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateWalletDto, FindWalletDto, UpdateWalletDto } from './wallet.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class WalletsService {
  constructor(@InjectConnection() private readonly knex: Knex) {}

  async create(createWalletDto: CreateWalletDto) {
    const newAddress = randomUUID().replaceAll('-', '');
    createWalletDto.address = newAddress;

    const result = await this.knex.table('wallets').insert(createWalletDto);

    const wallet = await this.findOne({ address: newAddress });

    return wallet;
  }

  // async list() {
  //   const wallets = await this.knex('wallets').select();

  //   return wallets;
  // }

  async update(filter: FindWalletDto, update: UpdateWalletDto) {
    const count = await this.knex('wallets')
      .where({ FindWalletDto })
      .update(update);

    const updates = await this.findOne(filter);

    return updates[0];
  }

  async findOne(filter: FindWalletDto) {
    const wallet = await this.knex.table('wallets').where(filter);

    if (!wallet.length) {
      return undefined;
    }

    return wallet[0];
  }
}
