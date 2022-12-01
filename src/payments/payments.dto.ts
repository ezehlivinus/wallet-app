import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';
import { TransactionTypes } from 'src/transactions/transactions.dto';

export enum PaymentTypeDto {
  fund = 'fund',
  withdraw = 'withdraw'
}

export class ResolveAccountNumberDto {
  @ApiProperty({
    type: String,
    description: 'Account number',
    example: '0001234567'
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  bankCode: number;
}

export class MakeWithdrawalDto {
  @ApiProperty({
    example: '044'
  })
  @IsString()
  bankCode: string;

  @ApiProperty({
    type: String,
    description: 'Account number',
    example: '0001234567'
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({
    description: 'wallet address to transfer money to'
  })
  @IsString()
  @IsNotEmpty()
  walletAddress: string;

}

export class CreateTransferRecipientDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsOptional()
  currency? = 'NGN';

  @ApiProperty({
    example: '044'
  })
  @IsString()
  bankCode: string;

  @ApiProperty({
    type: String,
    description: 'Account number',
    example: '0001234567'
  })
  @IsString()
  @IsNotEmpty()
  accountNumber: string;

  @ApiProperty()
  @IsNumber()
  @IsNotEmpty()
  amount?: number;
}

export class InitializePaymentDto {
  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
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

export class InitiateTransferDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  // @ApiProperty()
  // @IsString()
  // @IsNotEmpty()
  // walletAddress: string;
}

export class PaymentDto extends InitializePaymentDto {
  @ApiProperty()
  @IsString()
  reference: string;

  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
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

  @ApiProperty({
    example: '9fa2a1a3323x76f907e3feed28f4ae2'
  })
  @IsString()
  walletAddress?: string;
}


