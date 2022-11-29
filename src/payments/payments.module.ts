import { Module } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentsController } from './payments.controller';
import { WalletsModule } from 'src/wallets/wallets.module';

@Module({
  imports: [WalletsModule],
  providers: [PaymentsService],
  controllers: [PaymentsController],
  exports: [PaymentsService]
})
export class PaymentsModule {}
