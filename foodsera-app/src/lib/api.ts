import { Cart, CartItem, MenuItem, Order, Restaurant, User } from './types';

// Base API URLs for different services
const API_URLS = {
  auth: 'https://foodix.dynac.space:4000/auth-proxy/api',
  admin: 'https://foodix.dynac.space:4000/admin-proxy/api',
  delivery: 'https://foodix.dynac.space:4000/delivery-proxy/api',
  order: 'https://foodix.dynac.space:4000/order-proxy/api',
  payment: 'https://foodix.dynac.space:4000/payment-proxy/api',
  restaurant: 'https://foodix.dynac.space:4000/restaurent-proxy/api',
  notification: 'https://foodix.dynac.space:4000/notification-proxy/api',
};

// Get token from local storage
const getToken = () => localStorage.getItem('token');

// Helper for making authenticated requests
const fetchWithAuth = async (service: keyof typeof API_URLS, endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URLS[service]}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: 'Something went wrong',
    }));
    throw new Error(error.message || 'Something went wrong');
  }

  return response.json();
};

// Auth API
export const authAPI = {
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: string;
    address?: string;
    phoneNumber?: string;
  }) => {
    return fetchWithAuth('auth', '/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return fetchWithAuth('auth', '/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return fetchWithAuth('auth', '/auth/profile');
  },

  updateProfile: async (userData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URLS.auth}/auth/profile`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token || '',
      },
      body: userData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Something went wrong',
      }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  // Admin specific methods
  getAllUsers: async (role?: string) => {
    const queryString = role ? `?role=${role}` : '';
    return fetchWithAuth('auth', `/auth/users${queryString}`);
  },
};

// Restaurant API
export const restaurantAPI = {
  getAllRestaurants: async () => {
    return fetchWithAuth('restaurant', '/restaurants');
  },

  getRestaurantById: async (id: string) => {
    return fetchWithAuth('restaurant', `/restaurants/${id}`);
  },

  getMenuItems: async (restaurantId: string) => {
    return fetchWithAuth('restaurant', `/restaurants/${restaurantId}/menu`);
  },

  getAllCategories: async () => {
    return fetchWithAuth('restaurant', '/restaurants/categories');
  },

  // Restaurant owner methods
  createRestaurant: async (restaurantData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URLS.restaurant}/restaurants`, {
      method: 'POST',
      headers: {
        'x-auth-token': token || '',
      },
      body: restaurantData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Something went wrong',
      }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  updateRestaurant: async (id: string, restaurantData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URLS.restaurant}/restaurants/${id}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token || '',
      },
      body: restaurantData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Something went wrong',
      }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  addMenuItem: async (restaurantId: string, menuItemData: FormData) => {
    if (!menuItemData.has('restaurantId')) {
      menuItemData.append('restaurantId', restaurantId);
    }

    const token = getToken();
    console.log(`Adding menu item to restaurant: ${restaurantId}`);

    try {
      const response = await fetch(`${API_URLS.restaurant}/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || '',
        },
        body: menuItemData,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({
          message: 'Something went wrong',
        }));
        throw new Error(error.message || 'Something went wrong');
      }

      return response.json();
    } catch (error) {
      console.error('API Error in addMenuItem:', error);
      throw error;
    }
  },

  updateMenuItem: async (itemId: string, menuItemData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URLS.restaurant}/restaurants/menu/${itemId}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token || '',
      },
      body: menuItemData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Something went wrong',
      }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  deleteMenuItem: async (itemId: string) => {
    return fetchWithAuth('restaurant', `/restaurants/menu/${itemId}`, {
      method: 'DELETE',
    });
  },
};

// Order API
export const orderAPI = {
  createOrder: async (orderData: {
    userId: string;
    restaurantId: string;
    items: Omit<CartItem, '_id' | 'menuItem'>[];
    subtotal: number;
    tax: number;
    deliveryFee: number;
    tip: number;
    total: number;
    paymentMethod: string;
    deliveryAddress: string;
    customerLocation?: { latitude: number; longitude: number };
  }) => {
    return fetchWithAuth('order', '/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getUserOrders: async (userId: string) => {
    return fetchWithAuth('order', `/orders/user/${userId}`);
  },

  getOrderById: async (id: string) => {
    return fetchWithAuth('order', `/orders/${id}`);
  },

  // Restaurant owner methods
  getRestaurantOrders: async (restaurantId: string, status?: string) => {
    try {
      const queryString = status ? `?status=${status}` : '';
      console.log('rid', restaurantId, 'qi', queryString)
      return await fetchWithAuth('order', `/orders/restaurant/${restaurantId}${queryString}`);
    } catch (error) {
      if (error instanceof Error && error.message === 'Restaurant not found') {
        return [];
      }
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return fetchWithAuth('order', `/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  assignDriver: async (orderId: string, driverId: string) => {
    return fetchWithAuth('order', `/orders/${orderId}/assign-driver`, {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    });
  },

  // Delivery driver methods
  getDriverOrders: async (status: string, userId: string) => {
    return fetchWithAuth('order', `/orders/driver/orders?status=${status}&userId=${userId}`);
  },

  updateDriverLocation: async (data: {
    orderId: string;
    latitude: number;
    longitude: number;
  }) => {
    return fetchWithAuth('order', '/orders/driver/location', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (data: { amount: number; orderId: string, userId: string }) => {
    return fetchWithAuth('payment', '/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirmPayment: async (data: { paymentIntentId: string; orderId: string }) => {
    return fetchWithAuth('payment', '/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPaymentMethods: async () => {
    return fetchWithAuth('payment', '/payments/methods');
  },

  processRefund: async (data: {
    orderId: string;
    amount: number;
    reason: string;
  }) => {
    return fetchWithAuth('payment', '/payments/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Delivery API
export const deliveryAPI = {
  getAvailableDrivers: async () => {
    return fetchWithAuth('delivery', '/delivery/available');
  },

  getDriverProfile: async () => {
    return fetchWithAuth('delivery', '/delivery/profile');
  },

  updateDriverProfile: async (profileData: {
    name?: string;
    phone?: string;
    photo?: string;
  }) => {
    return fetchWithAuth('delivery', '/delivery/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updateDriverStatus: async (statusData: {
    status: 'available' | 'busy' | 'offline';
    driverId: string;
  }) => {
    return fetchWithAuth('delivery', '/delivery/status', {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },
};

// Admin API for main admin dashboard
export const adminAPI = {
  // Category management
  getAllCategories: async () => {
    return fetchWithAuth('restaurant', '/restaurants/categories');
  },

  createCategory: async (categoryData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URLS.restaurant}/restaurants/categories`, {
      method: 'POST',
      headers: {
        'x-auth-token': token || '',
      },
      body: categoryData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Something went wrong',
      }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  updateCategory: async (categoryId: string, categoryData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URLS.restaurant}/restaurants/categories/${categoryId}`, {
      method: 'PUT',
      headers: {
        'x-auth-token': token || '',
      },
      body: categoryData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: 'Something went wrong',
      }));
      throw new Error(error.message || 'Something went wrong');
    }

    return response.json();
  },

  deleteCategory: async (categoryId: string) => {
    return fetchWithAuth('restaurant', `/restaurants/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },

  // Restaurant management
  getAllRestaurants: async () => {
    return fetchWithAuth('restaurant', '/restaurants');
  },

  approveRestaurant: async (restaurantId: string) => {
    return fetchWithAuth('restaurant', `/restaurants/${restaurantId}/approve`, {
      method: 'PUT',
    });
  },

  suspendRestaurant: async (restaurantId: string) => {
    return fetchWithAuth('restaurant', `/restaurants/${restaurantId}/suspend`, {
      method: 'PUT',
    });
  },

  // Driver management
  getAllDrivers: async () => {
    return fetchWithAuth('admin', '/admin/drivers');
  },

  approveDriver: async (driverId: string) => {
    return fetchWithAuth('admin', `/admin/drivers/${driverId}/approve`, {
      method: 'PUT',
    });
  },

  suspendDriver: async (driverId: string) => {
    return fetchWithAuth('admin', `/admin/drivers/${driverId}/suspend`, {
      method: 'PUT',
    });
  },

  // Dashboard statistics
  getDashboardStats: async () => {
    return fetchWithAuth('admin', '/admin/stats');
  },

  // Customer management
  getAllCustomers: async () => {
    return fetchWithAuth('admin', '/admin/customers');
  },
};
