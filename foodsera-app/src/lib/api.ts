import { Cart, CartItem, MenuItem, Order, Restaurant, User } from './types';

// Base API URL
const API_URL = 'http://localhost:5001/api';

// Get token from local storage
const getToken = () => localStorage.getItem('token');

// Helper for making authenticated requests
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'x-auth-token': token } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
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
    return fetchWithAuth('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  login: async (credentials: { email: string; password: string }) => {
    return fetchWithAuth('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  getProfile: async () => {
    return fetchWithAuth('/auth/profile');
  },

  updateProfile: async (userData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/auth/profile`, {
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
    return fetchWithAuth(`/auth/users${queryString}`);
  },
};

// Restaurant API
export const restaurantAPI = {
  getAllRestaurants: async () => {
    return fetchWithAuth('/restaurants');
  },

  getRestaurantById: async (id: string) => {
    return fetchWithAuth(`/restaurants/${id}`);
  },

  getMenuItems: async (restaurantId: string) => {
    return fetchWithAuth(`/restaurants/${restaurantId}/menu`);
  },

  getAllCategories: async () => {
    return fetchWithAuth('/restaurants/categories');
  },

  // Restaurant owner methods
  createRestaurant: async (restaurantData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/restaurants`, {
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
    const response = await fetch(`${API_URL}/restaurants/${id}`, {
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
    // Make sure we're attaching the current restaurantId to the form data
    if (!menuItemData.has('restaurantId')) {
      menuItemData.append('restaurantId', restaurantId);
    }
    
    const token = getToken();
    console.log(`Adding menu item to restaurant: ${restaurantId}`);
    
    try {
      const response = await fetch(`${API_URL}/restaurants/${restaurantId}/menu`, {
        method: 'POST',
        headers: {
          'x-auth-token': token || '',
          // Remove Content-Type header to let the browser set it with the boundary
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
    const response = await fetch(`${API_URL}/restaurants/menu/${itemId}`, {
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
    return fetchWithAuth(`/restaurants/menu/${itemId}`, {
      method: 'DELETE',
    });
  },
};

// Order API
export const orderAPI = {
  createOrder: async (orderData: {
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
    return fetchWithAuth('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
  },

  getUserOrders: async () => {
    return fetchWithAuth('/orders/user');
  },

  getOrderById: async (id: string) => {
    return fetchWithAuth(`/orders/${id}`);
  },

  // Restaurant owner methods
  getRestaurantOrders: async (restaurantId: string, status?: string) => {
    try {
      const queryString = status ? `?status=${status}` : '';
      console.log('rid',restaurantId, 'qi', queryString)
      return await fetchWithAuth(`/orders/restaurant/${restaurantId}${queryString}`);
    } catch (error) {
      // Handle case where restaurant doesn't exist yet
      if (error instanceof Error && error.message === 'Restaurant not found') {
        return []; // Return empty array instead of throwing error
      }
      throw error;
    }
  },

  updateOrderStatus: async (orderId: string, status: string) => {
    return fetchWithAuth(`/orders/${orderId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  assignDriver: async (orderId: string, driverId: string) => {
    return fetchWithAuth(`/orders/${orderId}/assign-driver`, {
      method: 'PUT',
      body: JSON.stringify({ driverId }),
    });
  },

  // Delivery driver methods
  getDriverOrders: async (status?: string) => {
    const queryString = status ? `?status=${status}` : '';
    return fetchWithAuth(`/orders/driver/orders${queryString}`);
  },

  updateDriverLocation: async (data: {
    orderId: string;
    latitude: number;
    longitude: number;
  }) => {
    return fetchWithAuth('/orders/driver/location', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};

// Payment API
export const paymentAPI = {
  createPaymentIntent: async (data: { amount: number; orderId: string }) => {
    return fetchWithAuth('/payments/create-payment-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  confirmPayment: async (data: { paymentIntentId: string; orderId: string }) => {
    return fetchWithAuth('/payments/confirm', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPaymentMethods: async () => {
    return fetchWithAuth('/payments/methods');
  },

  processRefund: async (data: {
    orderId: string;
    amount: number;
    reason: string;
  }) => {
    return fetchWithAuth('/payments/refund', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

// Delivery API
export const deliveryAPI = {
  getAvailableDrivers: async () => {
    return fetchWithAuth('/delivery/available');
  },

  getDriverProfile: async () => {
    return fetchWithAuth('/delivery/profile');
  },

  updateDriverProfile: async (profileData: {
    name?: string;
    phone?: string;
    photo?: string;
  }) => {
    return fetchWithAuth('/delivery/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  updateDriverStatus: async (statusData: {
    status: 'available' | 'busy' | 'offline';
    currentLocation?: {
      latitude: number;
      longitude: number;
    };
  }) => {
    return fetchWithAuth('/delivery/status', {
      method: 'PUT',
      body: JSON.stringify(statusData),
    });
  },
};

// Admin API for main admin dashboard
export const adminAPI = {
  // Category management
  getAllCategories: async () => {
    return fetchWithAuth('/admin/categories');
  },
  
  createCategory: async (categoryData: FormData) => {
    const token = getToken();
    const response = await fetch(`${API_URL}/admin/categories`, {
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
    const response = await fetch(`${API_URL}/admin/categories/${categoryId}`, {
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
    return fetchWithAuth(`/admin/categories/${categoryId}`, {
      method: 'DELETE',
    });
  },
  
  // Restaurant management
  getAllRestaurants: async () => {
    return fetchWithAuth('/restaurants');
  },
  
  approveRestaurant: async (restaurantId: string) => {
    return fetchWithAuth(`/admin/restaurants/${restaurantId}/approve`, {
      method: 'PUT',
    });
  },
  
  suspendRestaurant: async (restaurantId: string) => {
    return fetchWithAuth(`/admin/restaurants/${restaurantId}/suspend`, {
      method: 'PUT',
    });
  },
  
  // Driver management
  getAllDrivers: async () => {
    return fetchWithAuth('/admin/drivers');
  },
  
  approveDriver: async (driverId: string) => {
    return fetchWithAuth(`/admin/drivers/${driverId}/approve`, {
      method: 'PUT',
    });
  },
  
  suspendDriver: async (driverId: string) => {
    return fetchWithAuth(`/admin/drivers/${driverId}/suspend`, {
      method: 'PUT',
    });
  },
  
  // Dashboard statistics
  getDashboardStats: async () => {
    return fetchWithAuth('/admin/stats');
  },
  
  // Customer management
  getAllCustomers: async () => {
    return fetchWithAuth('/admin/customers');
  },
};
