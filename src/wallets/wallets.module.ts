import { Module } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';

@Module({
  providers: [WalletsService],
  exports: [WalletsService],
  controllers: [WalletsController]
})
export class WalletsModule {}
