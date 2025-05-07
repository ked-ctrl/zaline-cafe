// Environment variables
export const SUPABASE_CONFIG = {
  URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
};

// Database tables
export const TABLES = {
  MENU: 'menu',
  CART: 'cart',
  USERS: 'users',
  ORDERS: 'orders',
  ORDER_ITEMS: 'order_items',
};

// Storage buckets
export const STORAGE_BUCKETS = {
  MENU_IMAGES: 'menu-images',
};

// Validate environment variables
if (!SUPABASE_CONFIG.URL || !SUPABASE_CONFIG.ANON_KEY) {
  throw new Error('Missing Supabase environment variables');
}
