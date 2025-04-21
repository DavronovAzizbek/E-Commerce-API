import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BasketsService } from './baskets.service';
import { CreateBasketDto } from './dto/create-basket.dto';
import { UpdateBasketDto } from './dto/update-basket.dto';

@Controller('baskets')
export class BasketsController {
  constructor(private readonly basketsService: BasketsService) {}

  @Post()
  create(@Body() createBasketDto: CreateBasketDto) {
    return this.basketsService.create(createBasketDto);
  }

  @Get()
  findAll() {
    return this.basketsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.basketsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBasketDto: UpdateBasketDto) {
    return this.basketsService.update(+id, updateBasketDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.basketsService.remove(+id);
  }
}
