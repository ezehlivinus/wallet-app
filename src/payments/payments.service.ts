import * as child_process from 'child_process';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import {
  InitializePaymentDto,
  InitiateTransferDto,
  PaymentDto,
  PaymentFindingDto
} from './payments.dto';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { UserFindDto } from 'src/users/users.dto';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectConnection() private readonly knex: Knex,
    private configService: ConfigService
  ) {}

  async randomString() {
    const random = Math.random().toString(36).slice(2) + randomUUID();

    return random.replaceAll('-', '');
  }

  async runCmd(cmd: string) {
    const resp = child_process.execSync(cmd);
    const result = resp.toString('utf-8');
    return result;
  }

  async initialize(
    initializePaymentDto: InitializePaymentDto & { user?: UserFindDto }
  ) {
    const { paystackSecretKey } = this.configService.get('payments');

    const {
      user: { email, id },
      amount,
      walletAddress
    } = initializePaymentDto;
    const reference = await this.randomString();
    const bodyParams = JSON.stringify({
      email,
      amount: amount * 100,
      reference,
      callback_url: 'http://localhost:9092/api/payments/callback-url'
    });

    const url = 'https://api.paystack.co/transaction/initialize';

    const cmd = `curl '${url}' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${paystackSecretKey}' -d '${bodyParams}' -X POST`;

    const trxProvider = this.knex.transactionProvider();
    const dbTransaction = await trxProvider();
    try {
      const result = await Promise.all([
        this.runCmd(cmd),
        dbTransaction('payments').insert({
          reference,
          customer: id,
          walletAddress,
          type: initializePaymentDto.type
        })
      ]);

      const response = JSON.parse(result[0]);
      if (!response?.status) {
        throw new InternalServerErrorException('Could not initialize Payments');
      }

      await dbTransaction.commit();
      return response;
    } catch (error) {
      await dbTransaction.rollback(error);
      throw new InternalServerErrorException(error);
    }
  }

  async verify(reference: string) {
    const { paystackSecretKey } = this.configService.get('payments');
    const url = 'https://api.paystack.co/transaction/verify/' + reference;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`
      }
    });

    if (!response.status) {
      throw new InternalServerErrorException(
        'Could not verify Payments transaction'
      );
    }

    return response.data.data;
  }

  async update(
    filter: Partial<PaymentFindingDto>,
    update: Partial<PaymentDto>
  ): Promise<PaymentDto> {
    const result = await this.knex('payments').update(update).where(filter);

    const payment = await this.knex('payments').where(filter).first();

    return payment;
  }

  async findOne(filter: Partial<PaymentFindingDto>): Promise<PaymentDto> {
    const payment = await this.knex('payments').where(filter).first();

    return payment;
  }

  async find(filter: Partial<PaymentFindingDto>) {
    const payments = await this.knex('payments').where(filter);

    return payments;
  }

  async randomUniqueString(length = 10): Promise<string> {
    const charSet =
      'ABCDEFGHIJ012KLSTYLERSINMNOPQRSTUVWXYZ345abcdefghijklmnopq6789rstuvwxyz';
    let randomString = '';
    for (let count = 0; count < length; count += 1) {
      const randomPoz = Math.floor(Math.random() * charSet.length);
      randomString += charSet.substring(randomPoz, randomPoz + 1);
    }
    return randomString;
  }

  // async 

  async initiateTransfer(initiateTransferDto: InitiateTransferDto) {
    const { paystackSecretKey } = this.configService.get('payments');

    const { amount } = initiateTransferDto;

    const recipient = await this.randomUniqueString(10);

    const reference = await this.randomString()

    const url = 'https://api.paystack.co/transaction/transfer';

    const bodyParams = JSON.stringify({
      source: 'balance',
      reason: 'Customer money Withdrawal',
      amount: amount * 100,
      reference,
      recipient: `RCP_${recipient}`,
      callback_url: 'http://localhost:9092/api/payments/callback-url'
    });

    const cmd = `curl '${url}' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${paystackSecretKey}' -d '${bodyParams}' -X POST`;
  }
}
