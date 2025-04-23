import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryResponse } from './category.types';
import { Product } from '../products/entities/product.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(
    createCategoryDto: CreateCategoryDto,
  ): Promise<CategoryResponse> {
    const { parentId, ...categoryData } = createCategoryDto;
    const category = this.categoryRepository.create(categoryData);

    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new HttpException(
          `Parent category with ID ${parentId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      category.parent = parent;
    }

    const savedCategory = await this.categoryRepository.save(category);
    return {
      id: savedCategory.id,
      name: savedCategory.name,
      description: savedCategory.description,
      image: savedCategory.image,
      parentId: savedCategory.parent ? savedCategory.parent.id : null,
      children: [],
    };
  }

  async findAll(): Promise<CategoryResponse[]> {
    const categories = await this.categoryRepository.find({
      relations: ['parent', 'children'],
    });
    return categories.map((category) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      parentId: category.parent ? category.parent.id : null,
      children: category.children?.map((child) => child.id) || [],
    }));
  }

  async findOne(id: number): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children'],
    });
    if (!category) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }
    return {
      id: category.id,
      name: category.name,
      description: category.description,
      image: category.image,
      parentId: category.parent ? category.parent.id : null,
      children: category.children?.map((child) => child.id) || [],
    };
  }

  async update(
    id: number,
    updateCategoryDto: UpdateCategoryDto,
  ): Promise<CategoryResponse> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const { parentId, ...categoryData } = updateCategoryDto;
    if (parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { id: parentId },
      });
      if (!parent) {
        throw new HttpException(
          `Parent category with ID ${parentId} not found`,
          HttpStatus.NOT_FOUND,
        );
      }
      category.parent = parent;
    }

    Object.assign(category, categoryData);
    const updatedCategory = await this.categoryRepository.save(category);
    return {
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      image: updatedCategory.image,
      parentId: updatedCategory.parent ? updatedCategory.parent.id : null,
      children: updatedCategory.children?.map((child) => child.id) || [],
    };
  }

  async remove(id: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['children'],
    });
    if (!category) {
      throw new HttpException(
        `Category with ID ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const products = await this.productRepository.find({
      where: { category: { id } },
    });
    if (products.length > 0) {
      throw new HttpException(
        `Cannot delete category with ID ${id} because it has associated products`,
        HttpStatus.BAD_REQUEST,
      );
    }

    if (category.children && category.children.length > 0) {
      await this.categoryRepository.update(
        { parent: { id } },
        { parent: null },
      );
    }

    await this.categoryRepository.delete(id);
  }
}
