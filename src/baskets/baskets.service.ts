import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Basket } from './entities/basket.entity';
import { AddToBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';
import { Product } from 'src/products/entities/product.entity';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { BasketResponse } from './basket.types';

@Injectable()
export class BasketService {
  constructor(
    @InjectRepository(Basket)
    private basketRepository: Repository<Basket>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async addToBasket(
    addToBasketDto: AddToBasketDto,
    currentUser: JwtPayload,
  ): Promise<BasketResponse> {
    const { productId, quantity } = addToBasketDto;
    if (quantity <= 0) {
      throw new HttpException(
        'Quantity must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }

    const product = await this.productRepository.findOne({
      where: { id: productId },
    });
    if (!product) {
      throw new HttpException(
        `Product with ID ${productId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    if (product.stock < quantity) {
      throw new HttpException(
        `Insufficient stock for product ID ${productId}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const existingBasket = await this.basketRepository.findOne({
      where: { user: { id: currentUser.id }, product: { id: productId } },
    });

    let basket: Basket;
    if (existingBasket) {
      existingBasket.quantity += quantity;
      basket = await this.basketRepository.save(existingBasket);
    } else {
      basket = this.basketRepository.create({
        user: { id: currentUser.id },
        product,
        quantity,
      });
      basket = await this.basketRepository.save(basket);
    }

    return {
      id: basket.id,
      productId: basket.product.id,
      quantity: basket.quantity,
    };
  }

  async findAll(currentUser: JwtPayload): Promise<BasketResponse[]> {
    const baskets = await this.basketRepository.find({
      where: { user: { id: currentUser.id } },
      relations: ['product'],
    });
    return baskets.map((basket) => ({
      id: basket.id,
      productId: basket.product.id,
      quantity: basket.quantity,
    }));
  }

  async update(
    id: number,
    updateBasketDto: UpdateBasketDto,
    currentUser: JwtPayload,
  ): Promise<BasketResponse> {
    const basket = await this.basketRepository.findOne({
      where: { id, user: { id: currentUser.id } },
      relations: ['product'],
    });
    if (!basket) {
      throw new HttpException(
        `Basket item with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { quantity } = updateBasketDto;
    if (quantity <= 0) {
      throw new HttpException(
        'Quantity must be greater than 0',
        HttpStatus.BAD_REQUEST,
      );
    }
    if (basket.product.stock < quantity) {
      throw new HttpException(
        `Insufficient stock for product ID ${basket.product.id}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    basket.quantity = quantity;
    const updatedBasket = await this.basketRepository.save(basket);
    return {
      id: updatedBasket.id,
      productId: updatedBasket.product.id,
      quantity: updatedBasket.quantity,
    };
  }

  async remove(id: number, currentUser: JwtPayload): Promise<void> {
    const basket = await this.basketRepository.findOne({
      where: { id, user: { id: currentUser.id } },
    });
    if (!basket) {
      throw new HttpException(
        `Basket item with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.basketRepository.delete(id);
  }

  async clear(currentUser: JwtPayload): Promise<void> {
    const baskets = await this.basketRepository.find({
      where: { user: { id: currentUser.id } },
    });
    await this.basketRepository.delete(baskets.map((basket) => basket.id));
  }
}
