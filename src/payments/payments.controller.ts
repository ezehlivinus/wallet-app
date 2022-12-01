import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  Redirect,
  Req,
  Res
} from '@nestjs/common';

import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import * as express from 'express';
import { Auth } from 'src/common/decorators/http.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ErrorResponseDTO } from 'src/common/dtos/response.dto';
import { CreateTransactionDto } from 'src/transactions/transactions.dto';
import { Roles, UserFindDto } from 'src/users/users.dto';
import { WalletsService } from 'src/wallets/wallets.service';
import {
  InitializePaymentDto,
  MakeWithdrawalDto,
  PaymentDto
} from './payments.dto';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private paymentsService: PaymentsService,
    private walletsService: WalletsService
  ) {}

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Endpoint for for funding wallet ',
    description: 'A payment link would be generated use it to fund your account'
  })
  @ApiOkResponse({
    description: 'Registration is successful',
    type: InitializePaymentDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  @Auth([Roles.user])
  async initialize(
    @Body() initializePaymentDto: InitializePaymentDto,
    @CurrentUser() auth: { id: number; email: string }
  ) {
    const data = {
      ...initializePaymentDto,
      user: {
        id: auth.id,
        email: auth.email
      }
    };

    const wallet = await this.walletsService.findOne({
      owner: auth.id,
      address: data.walletAddress
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found for this user');
    }

    const result = await this.paymentsService.initialize(data);

    if (!result.status) {
      throw new BadRequestException(result.message);
    }

    // redirection to the payment url did not work

    return {
      data: {
        message:
          'copy and paste the authorization_url in your browser to make your payment',
        ...result.data
      }
    };
  }

  @Get('/callback-url')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary:
      'Endpoint for payments response as it relates with paystack callback url'
  })
  @ApiOkResponse({
    description: ' success',
    type: class Force {
      data: any;
    }
  })
  async callbackUrl(@Query() query) {
    const result = await this.paymentsService.verify(query.reference);

    const data = {
      reference: result.reference,
      transactionId: result.id,
      channel: result.channel,
      amount: result.amount
    };

    const payment = await this.paymentsService.findOne({
      reference: data.reference
    });

    if (payment?.reference && payment.amount) {
      return {
        data: {
          message:
            'This payment was successfully and has been processed earlier',
          payment
        }
      };
    }

    const updatePayment = await this.paymentsService.update(
      { reference: result.reference },
      data
    );

    const updateWallet = await this.walletsService.fund(
      {
        owner: updatePayment.customer,
        address: updatePayment.walletAddress
      },
      {
        balance: result.amount / 100 // This is to convert back from to naira amount
      }
    );

    return {
      data: {
        message: 'payment was success',
        payment: updatePayment,
        wallet: updateWallet
      }
    };
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Endpoint for listing user payments (funding and withrawal)'
  })
  @ApiOkResponse({
    description: ' success',
    type: [PaymentDto]
  })
  @Auth([Roles.user])
  async myPayments(@CurrentUser() auth: Partial<UserFindDto>) {
    const payments = await this.paymentsService.find({
      customer: auth.id
    });

    if (!payments?.length) {
      return {
        message: 'No payments found'
      };
    }
    return { data: payments };
  }

  // @Post('/')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({
  //   summary: 'Endpoint for for funding wallet and withdraw from wallet'
  // })
  // @ApiOkResponse({
  //   description: 'Registration is successful',
  //   type: InitializePaymentDto
  // })
  // @ApiBadRequestResponse({
  //   description: 'Credentials is invalid',
  //   type: ErrorResponseDTO
  // })
  // @Auth([Roles.user])
  // async initiateTransfer(
  //   @Body() initializePaymentDto: InitializePaymentDto,
  //   @CurrentUser() auth: { id: number; email: string }
  // ) {}

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Endpoint for verifying customers transfer',
    description: 'Only consumable by paystack'
  })
  @ApiOkResponse({
    description: 'Transfer was successful'
    // type: InitializePaymentDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  async verifyTransfer(
    @Req() req: express.Request,
    @Res() res: express.Response
  ) {
    const data = await this.paymentsService.validateWebhookEvent(req);
    console.log(data);
    return res.send(200);
  }

  @Post('/withdraw')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Endpoint that let customers to withdraw from their wallet',
    description:
      'This for customers who want to withdraw money from their wallet. This paystack account used is not yet business starter. We can not transfer to customer at this time'
  })
  @ApiOkResponse({
    description: 'With was successful'
    // type: InitializePaymentDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  @Auth([Roles.admin, Roles.user])
  async withdraw(
    @Body() body: MakeWithdrawalDto,
    @CurrentUser() auth: UserFindDto
  ) {
    const wallet = await this.walletsService.findOne({
      owner: auth.id,
      address: body.walletAddress
    });

    if (!wallet) {
      return {
        message: 'Wallet not found'
      };
    }
    const newBalance = wallet.balance - body.amount;
    if (newBalance < 0) {
      throw new BadRequestException('insufficient balance');
    }

    // this is not efficient, it is suppose to be a transaction
    const update = await this.walletsService.update(
      { address: wallet.address },
      {
        balance: newBalance
      }
    );

    // verify customer account details
    const bankDetails = await this.paymentsService.resolveAccountNumber(
      body.accountNumber,
      body.bankCode
    );
    // console.log(bankDetails)
    // create transfer recipient using bank account
    const newTransferRecipient =
      await this.paymentsService.createTransferRecipient({
        name: bankDetails.account_name,
        accountNumber: bankDetails.account_number,
        bankCode: body.bankCode,
        amount: body.amount,
        currency: 'NGN'
      });

    // I may save to database
    let paymentMethod = await this.paymentsService.findOnePaymentMethod({
      recipientCode: newTransferRecipient.recipient_code
    });

    // let newPaymentMethod;
    if (!paymentMethod) {
      await this.paymentsService.makeNewPaymentMethod({
        recipientCode: newTransferRecipient.recipient_code,
        bank: JSON.stringify(newTransferRecipient.bankDetails),
        customer: auth.id
      });

      paymentMethod = await this.paymentsService.findOnePaymentMethod({
        recipientCode: newTransferRecipient.recipient_code
      });
    }

    // initiate transfer
    /**
     * This request return this payload
     * {
        status: false,
        message: 'You cannot initiate third party payouts as a starter business'
      }

      more info: 
      - https://paystack.com/blog/product/paystack-starter-businesses
      - https://support.paystack.com/hc/en-us/articles/360009972779-How-do-I-activate-my-Paystack-Starter-Business-
     */
    // const transfer = await this.paymentsService.initiateTransfer({
    //   recipient: newTransferRecipient.recipient_code,
    //   amount: body.amount,
    //   userId: auth.id,
    //   walletAddress: body.walletAddress,
    //   paymentMethod: paymentMethod.id
    // });

    // verify transfer via webhook: webhook will take over from here

    return {
      data: {
        message:
          'Transfer recipient was created successfully. The payment is been processed',
        errorMessage:
          'You cannot initiate third party payouts as a starter business',
        newTransferRecipient
      }
    };
  }

  @Post('/list-banks')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'List banks to find bank code',
    description: 'List banks'
  })
  @ApiOkResponse({
    description: 'With was successful'
    // type: InitializePaymentDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  @Auth([Roles.admin, Roles.user])
  async listBanks() {
    const banks = await this.paymentsService.listBanks();

    return {
      data: banks
    };
  }
}
