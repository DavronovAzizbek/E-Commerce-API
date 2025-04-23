import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/users.module';
import { User } from './auth/entities/user.entity';
import { CategoryModule } from './category/category.module';
import { Basket } from './baskets/entities/basket.entity';
import { Order } from './orders/entities/order.entity';
import { Category } from './category/entities/category.entity';
import { ProductModule } from './products/products.module';
import { Product } from './products/entities/product.entity';
import { BasketModule } from './baskets/baskets.module';
import { OrderModule } from './orders/orders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Category, Product, Basket, Order],
        synchronize: configService.get('NODE_ENV') === 'development',
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
    CategoryModule,
    ProductModule,
    BasketModule,
    OrderModule,
    BasketModule,
  ],
})
export class AppModule {}
