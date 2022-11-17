import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsNumber } from 'class-validator';
export enum Roles {
  admin = 'admin',
  user = 'user'
}

export class UserDTO {
  @ApiProperty()
  email: string;

  // @ApiProperty({ enum: Roles })
  // role: string;
}

export class UserFindDto {
  @ApiProperty()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty()
  @IsOptional()
  @IsNumber()
  id?: number;
}
