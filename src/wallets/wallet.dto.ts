import { ApiHideProperty, ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';

export class WalletsDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsPositive()
  @IsNotEmpty()
  @IsNumber()
  balance: number;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  owner: number;
}

export class WalletsResponseTypeDto extends WalletsDto {
  @ApiProperty()
  @IsDateString()
  createdAt: Date;

  @ApiProperty()
  @IsDateString()
  updatedAt: Date;

  @ApiProperty()
  @IsNumber()
  id: number;
}

export class WalletsResponseDto {
  @ApiProperty()
  @IsBoolean()
  success: boolean;

  @ApiProperty({
    type: WalletsResponseTypeDto,
    isArray: true
  })
  data?: [WalletsResponseTypeDto];
}

export class CreateWalletDto {
  @IsString()
  @IsNotEmpty()
  address?: string;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  balance? = 0;

  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  owner: number;
}

export class UpdateWalletDto {
  @IsNumber()
  @IsPositive()
  @IsOptional()
  balance?: number;
}

export class FindWalletDto {
  @IsString()
  @IsOptional()
  address?: string;

  @IsNumber()
  @IsOptional()
  id?: string;

  @IsNumber()
  @IsOptional()
  owner?: number;

  @IsNumber()
  @IsOptional()
  balance?: number;
}
