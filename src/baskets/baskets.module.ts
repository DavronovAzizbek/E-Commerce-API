import { Module } from '@nestjs/common';
import { BasketsService } from './baskets.service';
import { BasketsController } from './baskets.controller';

@Module({
  controllers: [BasketsController],
  providers: [BasketsService],
})
export class BasketsModule {}
