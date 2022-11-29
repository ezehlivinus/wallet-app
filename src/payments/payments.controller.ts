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
import { InitializePaymentDto, PaymentDto } from './payments.dto';
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
    summary: 'Endpoint for for funding wallet and withdraw from wallet'
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
}
