import {
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString
} from 'class-validator';

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
}
