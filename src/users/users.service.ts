import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';
import { JwtPayload } from '../auth/types/jwt-payload.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findAll(): Promise<Partial<User>[]> {
    return this.userRepository.find({
      where: { role: 'User' },
      select: ['id', 'email', 'fullName', 'createdAt'],
    });
  }

  async findOne(id: number, currentUser: JwtPayload): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'email', 'fullName', 'createdAt'],
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUser.role !== 'Admin' && currentUser.id !== id) {
      throw new HttpException(
        'You can only view your own profile',
        HttpStatus.FORBIDDEN,
      );
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      createdAt: user.createdAt,
    };
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
    currentUser: JwtPayload,
  ): Promise<Partial<User>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUser.role !== 'Admin' && currentUser.id !== id) {
      throw new HttpException(
        'You can only update your own profile',
        HttpStatus.FORBIDDEN,
      );
    }

    if (updateUserDto.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });
      if (existingUser && existingUser.id !== id) {
        throw new HttpException('Email already in use', HttpStatus.BAD_REQUEST);
      }
      user.email = updateUserDto.email;
    }

    if (updateUserDto.password) {
      user.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const updatedUser = await this.userRepository.save(user);
    return {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      createdAt: updatedUser.createdAt,
    };
  }

  async remove(id: number, currentUser: JwtPayload): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    if (currentUser.role !== 'Admin' && currentUser.id !== id) {
      throw new HttpException(
        'You can only delete your own profile',
        HttpStatus.FORBIDDEN,
      );
    }
    await this.userRepository.delete(id);
  }
}
