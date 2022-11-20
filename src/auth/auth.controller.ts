import { Auth } from '../common/decorators/http.decorator';
import { ErrorResponseDTO } from '../common/dtos/response.dto';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import { CreateUserDto, CreateUserResponseDTO, LoginDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { WalletsService } from 'src/wallets/wallets.service';
import { CreateWalletDto } from 'src/wallets/wallet.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private walletService: WalletsService
  ) {}

  @Post('/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Endpoint for login' })
  @ApiOkResponse({
    description: 'Login is successful',
    type: CreateUserResponseDTO
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  async login(@Body() body: LoginDTO) {
    return await this.authService.login(body);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Endpoint for registration' })
  @ApiOkResponse({
    description: 'Registration is successful',
    type: CreateUserResponseDTO
  })
  @ApiBadRequestResponse({
    description: 'Credentials is invalid',
    type: ErrorResponseDTO
  })
  async auth(@Body() body: CreateUserDto) {
    const { data, access_token } = await this.authService.auth(body);
    const createWalletDto: CreateWalletDto = {
      owner: data.id
    };

    const { balance, address } = await this.walletService.create(
      createWalletDto
    );

    return {
      data: { ...data, wallet: { address, balance }, access_token }
    };
  }
}
