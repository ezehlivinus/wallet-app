import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';

export enum TransactionTypes {
  credit = 'credit',
  debit = 'debit'
}

export class CreateTransactionDto {
  // @ApiProperty({ enum: TransactionTypes })
  // @IsString()
  // @IsNotEmpty()
  // type: TransactionTypes;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  purpose?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}

export class FindTransactionDto {
  @ApiProperty()
  @IsString()
  @IsOptional()
  from?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  to?: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  reference?: string;

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsOptional()
  amount?: number;
}
