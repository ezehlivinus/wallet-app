import { Auth } from '../common/decorators/http.decorator';
import { ErrorResponseDTO } from '../common/dtos/response.dto';
import {
  BadRequestException,
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';
import {
  CreateUserDto,
  CreateUserResponseDTO,
  LoginDTO
  // LoginResponseDTO
} from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
@ApiTags('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

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
    return await this.authService.auth(body);
  }
}
