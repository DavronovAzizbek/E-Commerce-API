export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  categoryId?: number;
}
