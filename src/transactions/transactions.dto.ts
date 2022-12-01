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

  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
  @IsString()
  @IsNotEmpty()
  from: string;

  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
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
  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
  @IsString()
  @IsOptional()
  from?: string;

  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
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
