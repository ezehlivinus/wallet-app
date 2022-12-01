import * as child_process from 'child_process';
import * as express from 'express';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Knex } from 'knex';
import { InjectConnection } from 'nest-knexjs';
import {
  CreateTransferRecipientDto,
  InitializePaymentDto,
  InitiateTransferDto,
  PaymentDto,
  PaymentFindingDto
} from './payments.dto';
import axios from 'axios';
import { randomUUID } from 'crypto';
import * as crypto from 'crypto';
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
    return JSON.parse(result);
  }

  /**
   * @description This accepts payment from customers
   * @param initializePaymentDto InitializePaymentDto
   * @returns
   */
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
      callback_url:
        this.configService.get('app.appURL') + '/api/payments/callback-url'
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

      const response = result[0];
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

  /**
   * This verifies if the payment initiated with this.initialize() was successful
   * @param reference string
   * @returns object
   */
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

  /**
   * @description Verify customers account details
   * @returns
   */
  async resolveAccountNumber(accountNumber: string, backCode: string) {
    const { paystackSecretKey } = this.configService.get('payments');
    const url = `https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${backCode}`;

    // const response = await axios.get(url, {
    //   headers: {
    //     Authorization: `Bearer ${paystackSecretKey}`
    //   }
    // });
    const cmd = `curl '${url}' -H 'Authorization: Bearer ${paystackSecretKey}' -X GET`;
    const response = await this.runCmd(cmd);

    if (!response.status) {
      throw new BadRequestException(
        `Could not resolve account number for the provided bank. ${response?.message}`
      );
    }

    return response.data;
  }

  /**
   * @ description Create a new transfer recipient using customer's bank account
   * @ link paystack docs https://paystack.com/docs/transfers/single-transfers#create-a-transfer-recipient
   * @ link paystack docs https://paystack.com/docs/transfers/single-transfers#bank-account
   * @ param createTransferRecipientDto
   * @ returns
   */
  async createTransferRecipient(
    createTransferRecipientDto: CreateTransferRecipientDto
  ) {
    const { paystackSecretKey } = this.configService.get('payments');

    const url = 'https://api.paystack.co/transferrecipient';

    const bodyParams = JSON.stringify({
      type: 'nuban',
      name: createTransferRecipientDto.name,
      account_number: createTransferRecipientDto.accountNumber,
      bank_code: createTransferRecipientDto.bankCode,
      currency: createTransferRecipientDto.currency
    });

    const cmd = `curl '${url}' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${paystackSecretKey}' -d '${bodyParams}' -X POST`;

    const newTransferRecipient = await this.runCmd(cmd);

    if (!newTransferRecipient.status) {
      throw new InternalServerErrorException(
        'Could not create transfer recipient'
      );
    }

    const cmdResponse = newTransferRecipient.data;

    const {
      authorization_code,
      account_number,
      account_name,
      bank_code,
      bank_name
    } = cmdResponse.details;

    const response = {
      recipient_code: cmdResponse.recipient_code,
      type: cmdResponse.type,
      bankDetails: {
        authorization_code,
        account_number,
        account_name,
        bank_code,
        bank_name
      }
    };

    return response;
  }

  // make the transfer
  async initiateTransfer(
    initiateTransferDto: InitiateTransferDto & {
      recipient: string;
      userId: number;
      walletAddress?: string;
      paymentMethod?: number;
    }
  ) {
    const { paystackSecretKey } = this.configService.get('payments');

    const { amount, recipient, userId, walletAddress, paymentMethod } =
      initiateTransferDto;

    // const recipient = await this.randomUniqueString(10);

    const reference = await this.randomString();

    const url = 'https://api.paystack.co/transfer';

    const bodyParams = JSON.stringify({
      source: 'balance',
      reason: 'Customer money Withdrawal',
      amount: amount * 100,
      reference,
      recipient
      // callback_url:
      // this.configService.get('app.appURL') + '/payments/callback-url'
    });

    const cmd = `curl '${url}' -H 'Content-Type: application/json' -H 'Authorization: Bearer ${paystackSecretKey}' -d '${bodyParams}' -X POST`;

    const res = await this.runCmd(cmd);

    if (!res.status) {
      await this.initiateTransfer(initiateTransferDto);
      // throw new InternalServerErrorException('Could not initiate transfer');
    }

    const newTransfer = res.data;

    const response = {
      transfer_code: newTransfer.transfer_code,
      id: newTransfer.id,
      amount: newTransfer.amount,
      currency: newTransfer.currency,
      source: newTransfer.source,
      recipient: newTransfer.recipient,
      reason: newTransfer.reason,
      reference: newTransfer.reference,
      status: newTransfer.status
    };

    await this.knex('payments').insert({
      transactionId: response.id,
      amount: response.amount / 100,
      transferCode: response.transfer_code,
      reference,
      recipientCode: recipient,
      type: 'withdraw',
      customer: userId,
      walletAddress: walletAddress,
      paymentMethod
    });

    return response;
  }

  async verifyTransfer(initiateTransferDto) {
    const { paystackSecretKey } = this.configService.get('payments');
  }

  async validateWebhookEvent(req: express.Request) {
    const { paystackSecretKey } = this.configService.get('payments');

    const hash = crypto
      .createHmac('sha512', paystackSecretKey)
      .update(JSON.stringify(req?.body))
      .digest('hex');
    if (hash !== req?.headers['x-paystack-signature']) {
      throw new BadRequestException('validation forbidden');
    }

    const _data = req.body?.data;

    const data = {
      event: req.body.event,
      amount: _data.amount / 100,
      reason: _data.reason,
      source: _data.source,
      reference: _data.reference,
      transfer_code: _data.transfer_code,
      bankDetails: _data.details,
      recipient: {
        name: _data.recipient.name,
        recipient_code: _data.recipient.recipient_code,
        email: _data.recipient.email
      }
    };

    await this.knex('paymentMethods')
      .where({
        recipientCode: data.recipient.recipient_code
      })
      .update({
        bank: JSON.stringify({ ...data.bankDetails })
      });

    await this.knex('payments')
      .where({
        recipientCode: data.recipient.recipient_code
      })
      .update({
        transferCode: data.transfer_code
      });

    return data;
  }

  async listBanks(): Promise<string> {
    const { paystackSecretKey } = this.configService.get('payments');

    const url = 'https://api.paystack.co/bank?currency=NGN';

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`
      }
    });

    if (!response.status) {
      throw new BadRequestException('Could list banks');
    }

    return response.data.data;
  }

  async makeNewPaymentMethod(data: {
    card?: string;
    bank?: string;
    recipientCode: string;
    customer: number;
    authorizationCode?: string;
  }) {
    await this.knex('paymentMethods').insert({
      authorizationCode: data.authorizationCode ? data.authorizationCode : null,
      recipientCode: data.recipientCode,
      bank: data.bank ? data.bank : null,
      card: data.card ? data.card : null,
      customer: data.customer
    });
  }

  async findOnePaymentMethod(filter: {
    recipientCode?: string;
    authorizationCode?: string;
  }) {
    const paymentMethod = await this.knex('paymentMethods')
      .where(filter)
      .first();

    return paymentMethod;
  }
}
