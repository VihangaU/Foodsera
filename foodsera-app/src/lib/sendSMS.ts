// src/lib/sendSMS.jsx

const API_URL = 'http://localhost:5007/api/send-sms'; // Update with your actual API URL

// Function to send SMS
export const sendSMS = async (to, message) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ to, message }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to send SMS');
    }

    return response.json(); // Return the response if needed
  } catch (error) {
    console.error('Error sending SMS:', error);
    throw error; // Rethrow the error for further handling
  }
};