import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Category } from 'src/category/entities/category.entity';
import { ProductResponse } from './product.types';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(createProductDto: CreateProductDto): Promise<ProductResponse> {
    const { categoryId, ...productData } = createProductDto;
    const category = await this.categoryRepository.findOne({
      where: { id: categoryId },
    });
    if (!category) {
      throw new HttpException(
        `Category with ID ${categoryId} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const product = this.productRepository.create({ ...productData, category });
    const savedProduct = await this.productRepository.save(product);
    return {
      id: savedProduct.id,
      name: savedProduct.name,
      description: savedProduct.description,
      price: savedProduct.price,
      stock: savedProduct.stock,
      image: savedProduct.image,
      categoryId: savedProduct.category?.id,
    };
  }

  async findAll(): Promise<ProductResponse[]> {
    const products = await this.productRepository.find({
      relations: ['category'],
    });
    return products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      categoryId: product.category?.id,
    }));
  }

  async findOne(id: number): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      image: product.image,
      categoryId: product.category?.id,
    };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
  ): Promise<ProductResponse> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });
    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { categoryId, ...productData } = updateProductDto;
    if (categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: categoryId },
      });
      if (!category) {
        throw new HttpException(
          `Category with ID ${categoryId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      product.category = category;
    }

    Object.assign(product, productData);
    await this.productRepository.save(product);

    const updatedProduct = await this.productRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    return {
      id: updatedProduct.id,
      name: updatedProduct.name,
      description: updatedProduct.description,
      price: updatedProduct.price,
      stock: updatedProduct.stock,
      image: updatedProduct.image,
      categoryId: updatedProduct.category?.id,
    };
  }

  async remove(id: number): Promise<void> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new HttpException(
        `Product with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    await this.productRepository.delete(id);
  }
}
