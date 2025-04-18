
import { API_URL } from './config';

// Get auth token from local storage
const getToken = () => localStorage.getItem('authToken');

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || 'Something went wrong';
    throw new Error(errorMessage);
  }
  return response.json();
};

// Get all restaurants
export const getAllRestaurants = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants`, {
      method: 'GET',
      headers: {
        'x-auth-token': getToken() || '',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

// Get restaurant by ID
export const getRestaurantById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: 'GET',
      headers: {
        'x-auth-token': getToken() || '',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching restaurant:', error);
    throw error;
  }
};

// Get restaurant for current user
export const getMyRestaurant = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants/my`, {
      method: 'GET',
      headers: {
        'x-auth-token': getToken() || '',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching my restaurant:', error);
    throw error;
  }
};

// Create a new restaurant
export const createRestaurant = async (restaurantData) => {
  try {
    console.log('Creating restaurant with FormData...');
    
    // For debugging - log the contents of FormData
    if (restaurantData instanceof FormData) {
      console.log('FormData contains:');
      for (let [key, value] of restaurantData.entries()) {
        console.log(`${key}: ${value instanceof File ? `File: ${value.name}` : value}`);
      }
    }
    
    // Note: For FormData, don't set Content-Type header - browser will set it with boundary
    const response = await fetch(`${API_URL}/restaurants`, {
      method: 'POST',
      headers: {
        'x-auth-token': getToken() || '',
      },
      body: restaurantData, // FormData object containing text fields and files
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error creating restaurant:', error);
    throw error;
  }
};

// Update a restaurant
export const updateRestaurant = async (id, restaurantData) => {
  try {
    // If restaurantData is FormData, don't set Content-Type
    const headers = {
      'x-auth-token': getToken() || '',
    };

    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: 'PUT',
      headers,
      body: restaurantData,
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error updating restaurant:', error);
    throw error;
  }
};

// Delete a restaurant
export const deleteRestaurant = async (id) => {
  try {
    const response = await fetch(`${API_URL}/restaurants/${id}`, {
      method: 'DELETE',
      headers: {
        'x-auth-token': getToken() || '',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error deleting restaurant:', error);
    throw error;
  }
};

// Get all categories
export const getAllCategories = async () => {
  try {
    const response = await fetch(`${API_URL}/restaurants/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};
