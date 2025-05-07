/**
 * Order related types
 */

export type OrderStatus = 'pending' | 'processing' | 'brewing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  menu_item: {
    id: string;
    menu_name: string;
    menu_image: string;
  };
}

export interface Order {
  id: string;
  user_id: string;
  status: OrderStatus;
  total: number;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface OrderProgress {
  step: number;
  totalSteps: number;
  currentStatus: OrderStatus;
  isComplete: boolean;
}