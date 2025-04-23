import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Param,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { BasketService } from './baskets.service';
import { AddToBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { BasketResponse } from './basket.types';

@Controller('baskets')
export class BasketController {
  constructor(private basketService: BasketService) {}

  @Post('add')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async addToBasket(
    @Body() addToBasketDto: AddToBasketDto,
    @Request() req: { user: JwtPayload },
  ): Promise<BasketResponse> {
    return await this.basketService.addToBasket(addToBasketDto, req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async findAll(
    @Request() req: { user: JwtPayload },
  ): Promise<BasketResponse[]> {
    return await this.basketService.findAll(req.user);
  }

  @Patch('update/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async update(
    @Param('id') id: string,
    @Body() updateBasketDto: UpdateBasketDto,
    @Request() req: { user: JwtPayload },
  ): Promise<BasketResponse> {
    return await this.basketService.update(+id, updateBasketDto, req.user);
  }

  @Delete('remove/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async remove(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<void> {
    return await this.basketService.remove(+id, req.user);
  }

  @Delete('clear')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async clear(@Request() req: { user: JwtPayload }): Promise<void> {
    return await this.basketService.clear(req.user);
  }
}
