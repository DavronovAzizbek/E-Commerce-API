export interface CategoryResponse {
  id: number;
  name: string;
  description: string;
  image: string;
  parentId?: number;
  children?: number[];
}
