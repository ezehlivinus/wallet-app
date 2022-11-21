import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import { CreateWalletDto } from 'src/wallets/wallet.dto';
import { WalletsService } from 'src/wallets/wallets.service';
import { CreateTransactionDto, TransactionTypes } from './transactions.dto';

@Injectable()
export class TransactionsService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private walletsService: WalletsService
  ) {}

  async create(createTransactionDto: CreateTransactionDto) {
    const { amount, from, to } = createTransactionDto;

    const trxProvider = this.knex.transactionProvider();
    const dbTransaction = await trxProvider();

    try {
      const fromWallet = await dbTransaction('wallets')
        .where('address', from)
        .first();
      const walletNewAmount = fromWallet.balance - amount;

      if (walletNewAmount < 0) {
        throw new BadRequestException('Insufficient wallet balance');
      }

      const promiseResult = await Promise.all([
        dbTransaction('wallets')
          .update({
            balance: walletNewAmount
          })
          .where('address', from),

        dbTransaction('wallets')
          .update({
            balance: dbTransaction.raw(`?? + ${amount}`, ['balance'])
          })
          .where('address', to),

        dbTransaction('transactions').insert([
          {
            ...createTransactionDto,
            from: createTransactionDto.from,
            type: TransactionTypes.debit
          },
          {
            ...createTransactionDto,
            to: createTransactionDto.to,
            type: TransactionTypes.credit
          }
        ]),

        dbTransaction('transactions')
          .where({
            from,
            to
          })
          .orderBy('transactions.updatedAt')
          .first()
      ]);

      const result = promiseResult[3];

      if (!result) {
        throw new Error('Something failed, could not get the last transaction');
      }

      await dbTransaction.commit();

      return result;
    } catch (error) {
      await dbTransaction.rollback(error);
      throw new InternalServerErrorException(error);
    }
  }

  async myTransactions(userId: number) {
    const txns = await this.knex('wallets')
      .where({
        owner: userId
      })
      .join('transactions', function () {
        this.on('transactions.from', '=', 'wallets.address').orOn(
          'transactions.to',
          '=',
          'wallets.address'
        );
      })
      .orderBy('transactions.createdAt', 'asc');

    return txns;
  }
}
