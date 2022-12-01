import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags
} from '@nestjs/swagger';
import { CreateUserResponseDTO } from 'src/auth/auth.dto';
import { Auth } from 'src/common/decorators/http.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ErrorResponseDTO } from 'src/common/dtos/response.dto';
import { Roles, UserDTO, UserFindDto } from 'src/users/users.dto';
import { CreateTransactionDto, FindTransactionDto } from './transactions.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'End point for making transactions: transfer fund to another user',
    description: 'from: walletAdress, to: wallet address'
  })
  @ApiOkResponse({
    description: 'Transaction was successful',
    type: CreateTransactionDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  @Auth([Roles.user])
  async transferFund(
    @Body() body: CreateTransactionDto,
    @CurrentUser() auth: Partial<UserFindDto>
  ) {
    const newTransaction = await this.transactionService.create({
      ...body,
      userId: auth.id
    });

    return { data: newTransaction };
  }

  @Get('/:address')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint for getting user transactions' })
  @ApiOkResponse({
    description: ' success',
    type: [CreateTransactionDto]
  })
  @ApiParam({
    name: 'address',
    description: 'Wallet Address of the user',
    required: true,
    type: String
  })
  @Auth([Roles.user])
  async myTransactions(
    @CurrentUser() auth: Partial<UserFindDto>,
    @Param('address') address: string
  ) {
    const trans = await this.transactionService.myTransactions({
      address,
      owner: auth.id
    });

    if (!trans?.length) {
      return {
        message: 'No transaction found'
      };
    }
    return { data: trans };
  }
}
