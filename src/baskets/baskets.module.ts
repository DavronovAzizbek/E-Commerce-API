import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Basket } from './entities/basket.entity';
import { BasketService } from './baskets.service';
import { BasketController } from './baskets.controller';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Basket, Product])],
  providers: [BasketService],
  controllers: [BasketController],
})
export class BasketModule {}
