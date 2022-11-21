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
import { CreateUserResponseDTO } from 'src/auth/auth.dto';
import { Auth } from 'src/common/decorators/http.decorator';
import { CurrentUser } from 'src/common/decorators/user.decorator';
import { ErrorResponseDTO } from 'src/common/dtos/response.dto';
import { Roles, UserDTO, UserFindDto } from 'src/users/users.dto';
import { CreateTransactionDto } from './transactions.dto';
import { TransactionsService } from './transactions.service';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionsController {
  constructor(private transactionService: TransactionsService) {}
  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({})
  @ApiOkResponse({
    description: 'Registration is successful',
    type: CreateTransactionDto
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  @Auth([Roles.user])
  async transferFund(@Body() body: CreateTransactionDto) {
    const newTransaction = await this.transactionService.create(body);

    return { data: newTransaction };
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint for getting user transactions' })
  @ApiOkResponse({
    description: ' success',
    type: [CreateTransactionDto]
  })
  @Auth([Roles.user])
  async myTransactions(@CurrentUser() auth: Partial<UserFindDto>) {
    const trans = await this.transactionService.myTransactions(auth.id);

    return { data: trans };
  }
}
