import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { Auth } from 'src/common/decorators/http.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ErrorResponseDTO } from 'src/common/dtos/response.dto';
import { InitializePaymentDto } from 'src/payments/payments.dto';
import { CreateTransactionDto } from 'src/transactions/transactions.dto';
import { Roles, UserFindDto } from 'src/users/users.dto';
import { WalletsResponseDto, WalletsResponseTypeDto } from './wallet.dto';
import { WalletsService } from './wallets.service';

@ApiTags('wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Endpoint for listing user's wallets" })
  @ApiOkResponse({
    description: ' success',
    type: WalletsResponseDto
  })
  @Auth([Roles.user])
  async myWallet(@CurrentUser() auth: Partial<UserFindDto>) {
    const filter = { owner: auth.id };
    const wallets = await this.walletsService.find(filter);

    return { data: wallets };
  }

  @Post('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint for creating new wallet' })
  @ApiOkResponse({
    description: 'New address was created successful',
    type: WalletsResponseDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  @Auth([Roles.user])
  async create(@CurrentUser() auth: { id: number; email: string }) {
    const newWallet = await this.walletsService.create({ owner: auth.id });

    return { data: newWallet };
  }
}
