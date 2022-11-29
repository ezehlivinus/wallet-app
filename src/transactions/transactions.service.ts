import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateWalletDto } from 'src/wallets/wallet.dto';
import { WalletsService } from 'src/wallets/wallets.service';
import {
  CreateTransactionDto,
  FindTransactionDto,
  TransactionTypes
} from './transactions.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private walletsService: WalletsService
  ) {}

  async generateReference() {
    return String(randomUUID().split('-')[0] + Date.now());
  }

  async create(
    _createTransactionDto: CreateTransactionDto & { userId?: number }
  ) {
    const { amount, from, to } = _createTransactionDto;

    const { userId, ...createTransactionDto } = _createTransactionDto;

    const trxProvider = this.knex.transactionProvider();
    const dbTransaction = await trxProvider();

    const tranReference = await this.generateReference();

    try {
      const fromWallet = await dbTransaction('wallets')
        .where({
          address: from,
          owner: userId
        })
        .first();

      if (!fromWallet) {
        throw new NotFoundException('Wallet not found');
      }

      const walletNewAmount = fromWallet?.balance - amount;

      if (walletNewAmount < 0) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      const toWallet = await dbTransaction('wallets')
        .where('address', to)
        .first();

      const promiseResult = await Promise.all([
        dbTransaction('wallets')
          .update({
            balance: walletNewAmount
          })
          .where({
            address: from,
            owner: userId
          }),

        dbTransaction('wallets')
          .update({
            balance: dbTransaction.raw(`?? + ${amount}`, ['balance'])
          })
          .where('address', to),

        dbTransaction('transactions').insert([
          {
            ...createTransactionDto,
            from: createTransactionDto.from,
            type: TransactionTypes.debit,
            reference: tranReference,
            customer: userId
          },
          {
            ...createTransactionDto,
            to: createTransactionDto.to,
            type: TransactionTypes.credit,
            reference: tranReference,
            customer: toWallet.owner
          }
        ])

        // dbTransaction('transactions')
        //   .where({
        //     from,
        //     to
        //   })
        //   .orderBy('transactions.updatedAt')
        //   .first()
      ]);

      const newFromWallet = await dbTransaction('wallets')
        .where({
          owner: userId,
          address: from
        })
        .first();

      const newToWallet = await dbTransaction('wallets')
        .where('address', to)
        .first();

      // transaction history with the new wallet balance
      const newResult = await Promise.all([
        dbTransaction('transactions')
          .where({
            from,
            reference: tranReference
          })
          .update({
            walletBalance: newFromWallet.balance
          }),

        dbTransaction('transactions')
          .where({
            to,
            reference: tranReference
          })
          .update({
            walletBalance: newToWallet.balance
          }),
        dbTransaction('transactions')
          .where({
            from,
            to,
            customer: fromWallet.owner,
            reference: tranReference
          })
          .orderBy('transactions.updatedAt')
          .first()
      ]);

      const results = newResult[2];

      if (!results) {
        throw new Error('Something failed, could not get the last transaction');
      }

      await dbTransaction.commit();

      return results;
    } catch (error) {
      await dbTransaction.rollback(error);
      throw new InternalServerErrorException(error);
    }
  }

  async myTransactions(
    filter: Partial<FindTransactionDto> & { owner?: number }
  ) {
    const txns = await this.knex('wallets')
      .where({
        address: filter.address,
        owner: filter.owner
      })
      .join('transactions', function () {
        this.on('transactions.customer', '=', 'wallets.owner');
        // .orOn(
        //   'transactions.to',
        //   '=',
        //   'wallets.address'
        // );
      })
      .orderBy('transactions.createdAt', 'asc');

    return txns;
  }
}
