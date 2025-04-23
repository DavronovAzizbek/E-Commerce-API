import { IsInt, Min } from 'class-validator';

export class UpdateBasketDto {
  @IsInt()
  @Min(1)
  quantity: number;
}
