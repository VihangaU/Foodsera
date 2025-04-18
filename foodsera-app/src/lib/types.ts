export type UserRole = 'customer' | 'restaurant' | 'delivery' | 'admin' | 'driver' | 'main_admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: UserRole;
  driverStatus?: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating?: number;
  totalDeliveries?: number;
  phone?: string;
  address?: string;
  phoneNumber?: string;
  avatar?: string;
  createdAt?: string;
}

export interface Category {
  _id: string;
  name: string;
  image: string;
  createdAt?: string;
}

export interface Restaurant {
  _id: string;
  name: string;
  image: string;
  logo: string;
  description: string;
  rating: number;
  reviewCount: number;
  categories: string[];
  deliveryFee: number;
  deliveryTime: string;
  address: string;
  isOpen: boolean;
  owner?: string; // Add owner property to match with backend model
}

export interface MenuItem {
  _id: string;
  restaurantId: string;
  name: string;
  description: string;
  price: number;
  image: string;
  categories: string[];
  popular: boolean;
  available: boolean;
}

export interface CartItem {
  _id: string;
  menuItemId: string;
  menuItem?: MenuItem;
  quantity: number;
  restaurantId: string;
  specialInstructions?: string;
  
  name?: string;
  price?: number;
  image?: string;
}

export interface Cart {
  restaurantId: string | null;
  items: CartItem[];
}

export interface Order {
  _id: string;
  userId: string;
  restaurantId: string;
  items: CartItem[];
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'in-delivery' | 'delivered' | 'cancelled';
  subtotal: number;
  tax: number;
  deliveryFee: number;
  tip: number;
  total: number;
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  paymentMethod: 'card' | 'cash' | 'paypal';
  deliveryAddress: string;
  createdAt: string;
  estimatedDeliveryTime?: string;
  assignedDriverId?: string;
  assignedDriverName?: string;
  assignedDriverPhone?: string;
  assignedDriverPhoto?: string;
  customerLocation?: {
    latitude: number;
    longitude: number;
  };
  driverLocation?: {
    latitude: number;
    longitude: number;
  };
  restaurants?: Array<{
    _id: string;
    name: string;
    logo: string;
  }>;
}

export interface DeliveryDriver {
  _id: string;
  userId: string;
  name: string;
  phone: string;
  photo: string;
  status: 'available' | 'busy' | 'offline';
  currentLocation?: {
    latitude: number;
    longitude: number;
  };
  rating: number;
  totalDeliveries: number;
  isActive: boolean;
  createdAt: string;
}
