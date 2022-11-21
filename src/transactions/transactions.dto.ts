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
  @IsNotEmpty()
  @IsOptional()
  purpose? = '';

  @ApiProperty()
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  amount: number;
}
