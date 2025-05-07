// Authentication
export const AUTH = {
  COOKIES: {
    USER_SESSION: 'user-session',
    ADMIN_SESSION: 'admin-session',
  },
  REDIRECT_QUERY_PARAM: 'redirectedFrom',
};

// UI Constants
export const UI = {
  MOBILE_BREAKPOINT: 768,
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  SIGNUP: '/signup',
  ADMIN_LOGIN: '/admin-login',
  ADMIN_DASHBOARD: '/admin-dashboard',
  CUSTOMER_MENU: '/customer-menu',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDER_CONFIRMATION: '/order-confirmation',
  ORDER_TRACKING: '/order-tracking',
  ABOUT: '/about',
};

// Supabase
export const STORAGE = {
  BUCKETS: {
    MENU_IMAGES: 'menu-images',
  },
};

// API endpoints
export const API = {
  MENU: '/api/menu',
  CART: '/api/cart',
  AUTH: '/api/auth',
};
