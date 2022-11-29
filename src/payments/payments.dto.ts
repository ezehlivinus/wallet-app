import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TransactionTypes } from 'src/transactions/transactions.dto';

export enum PaymentTypeDto {
  fund = 'fund',
  withdraw = 'withdraw'
}

export class InitializePaymentDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @ApiProperty({ enum: PaymentTypeDto, default: PaymentTypeDto.fund })
  @IsString()
  @IsNotEmpty()
  type: PaymentTypeDto;
}

export class PaymentDto extends InitializePaymentDto {
  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty()
  @IsString()
  walletAddress: string;

  @ApiProperty()
  @IsNumber()
  customer: number;

  @ApiProperty()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsString()
  channel: string;

  @ApiProperty()
  @IsString()
  transactionId: string;
}

export class PaymentFindingDto {
  @ApiProperty()
  @IsNumber()
  id?: number;

  @ApiProperty()
  @IsString()
  reference?: string;

  @ApiProperty()
  @IsNumber()
  customer?: number;

  @ApiProperty()
  @IsString()
  walletAddress?: string;
}
