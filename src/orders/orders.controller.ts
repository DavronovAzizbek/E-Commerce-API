import {
  Controller,
  Post,
  Get,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { OrderService } from './orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { JwtPayload } from '../auth/types/jwt-payload.interface';
import { OrderResponse } from './order.types';

@Controller('orders')
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async create(@Request() req: { user: JwtPayload }): Promise<OrderResponse[]> {
    return await this.orderService.create(req.user);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin')
  async findAll(): Promise<OrderResponse[]> {
    return await this.orderService.findAll();
  }

  @Get('user/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('User')
  async findUserOrders(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<OrderResponse[]> {
    return await this.orderService.findUserOrders(+id, req.user);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('Admin', 'User')
  async findOne(
    @Param('id') id: string,
    @Request() req: { user: JwtPayload },
  ): Promise<OrderResponse> {
    return await this.orderService.findOne(+id, req.user);
  }
}
