// import { UserDTO } from '@/users/users.dto';
// import { User } from '@/users/user.schema';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  MinLength,
  IsNotEmpty,
  IsOptional,
  IsNumber
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class CreateUserDto {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(5)
  password: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {}

export class LoginDTO {
  @ApiProperty()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  password: string;
}

// class LoginActionDTO {
//   @ApiProperty()
//   access_token: string;

//   @ApiProperty({ type: UserDTO })
//   user: UserDTO;
// }

// export class LoginResponseDTO {
//   @ApiProperty()
//   status: string;

//   @ApiProperty({ type: LoginActionDTO })
//   data: LoginActionDTO;
// }

class _CreateUserResponseDTO extends CreateUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  wallet: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class CreateUserResponseDTO {
  @ApiProperty({ type: _CreateUserResponseDTO })
  data: _CreateUserResponseDTO;
}
