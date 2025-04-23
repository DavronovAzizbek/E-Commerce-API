import {
  IsString,
  IsOptional,
  IsInt,
  IsPositive,
  IsNotEmpty,
} from 'class-validator';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsNotEmpty()
  image: string;

  @IsOptional()
  @IsInt()
  @IsPositive()
  parentId?: number;
}
