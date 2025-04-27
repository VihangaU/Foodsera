import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5006/api';

export const getDriverOrders = async (status, userId) => {
    try {
        const response = await axios.get(`${API_URL}/orders/driver/orders`, {
            params: {
                status,
                userId
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching driver orders:', error);
        throw error;
    }
}; 