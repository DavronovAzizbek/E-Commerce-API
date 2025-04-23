import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { OrderService } from './orders.service';
import { OrderController } from './orders.controller';
import { Basket } from 'src/baskets/entities/basket.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Basket, Product, User])],
  providers: [OrderService],
  controllers: [OrderController],
})
export class OrderModule {}
