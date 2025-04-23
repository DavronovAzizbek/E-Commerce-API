import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Basket } from 'src/baskets/entities/basket.entity';
import { Product } from 'src/products/entities/product.entity';
import { User } from 'src/auth/entities/user.entity';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { OrderResponse } from './order.types';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Basket)
    private basketRepository: Repository<Basket>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(currentUser: JwtPayload): Promise<OrderResponse[]> {
    const baskets = await this.basketRepository.find({
      where: { user: { id: currentUser.id } },
      relations: ['product'],
    });

    if (baskets.length === 0) {
      throw new HttpException('Basket is empty', HttpStatus.BAD_REQUEST);
    }

    const user = await this.userRepository.findOne({
      where: { id: currentUser.id },
    });
    if (!user) {
      throw new HttpException(
        `User with ID ${currentUser.id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const orders: OrderResponse[] = [];
    for (const basket of baskets) {
      if (basket.product.stock < basket.quantity) {
        throw new HttpException(
          `Insufficient stock for product ID ${basket.product.id}`,
          HttpStatus.BAD_REQUEST,
        );
      }

      const order = this.orderRepository.create({
        quantity: basket.quantity,
        status: OrderStatus.PENDING,
      });

      order.user = user;
      order.product = basket.product;

      basket.product.stock -= basket.quantity;
      await this.productRepository.save(basket.product);

      const savedOrder = await this.orderRepository.save(order);
      orders.push({
        id: savedOrder.id,
        productId: savedOrder.product.id,
        quantity: savedOrder.quantity,
        status: savedOrder.status,
      });
    }

    await this.basketRepository.delete(baskets.map((basket) => basket.id));
    return orders;
  }

  async findAll(): Promise<OrderResponse[]> {
    const orders = await this.orderRepository.find({ relations: ['product'] });
    return orders.map((order) => ({
      id: order.id,
      productId: order.product.id,
      quantity: order.quantity,
      status: order.status,
    }));
  }

  async findUserOrders(
    id: number,
    currentUser: JwtPayload,
  ): Promise<OrderResponse[]> {
    if (currentUser.role !== 'Admin' && currentUser.id !== id) {
      throw new HttpException(
        'You can only view your own orders',
        HttpStatus.FORBIDDEN,
      );
    }

    const orders = await this.orderRepository.find({
      where: { user: { id } },
      relations: ['product'],
    });
    return orders.map((order) => ({
      id: order.id,
      productId: order.product.id,
      quantity: order.quantity,
      status: order.status,
    }));
  }

  async findOne(id: number, currentUser: JwtPayload): Promise<OrderResponse> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['product', 'user'],
    });
    if (!order) {
      throw new HttpException(
        `Order with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (currentUser.role !== 'Admin' && order.user.id !== currentUser.id) {
      throw new HttpException(
        'You can only view your own orders',
        HttpStatus.FORBIDDEN,
      );
    }
    return {
      id: order.id,
      productId: order.product.id,
      quantity: order.quantity,
      status: order.status,
    };
  }
}
