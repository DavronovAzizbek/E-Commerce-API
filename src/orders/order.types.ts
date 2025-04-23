import { OrderStatus } from './entities/order.entity';

export interface OrderResponse {
  id: number;
  productId: number;
  quantity: number;
  status: OrderStatus;
}
