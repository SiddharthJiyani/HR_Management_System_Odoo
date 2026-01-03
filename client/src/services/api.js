const API_BASE_URL = 'http://localhost:4000/api';

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include', // Include cookies for authentication
    ...options,
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API call error:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Sign up function
  signup: async (userData) => {
    return apiCall('/auth/signup', {
      method: 'POST',
      body: userData,
    });
  },

  // Sign in function
  signin: async (credentials) => {
    return apiCall('/auth/login', {
      method: 'POST',
      body: credentials,
    });
  },

  // Send OTP function (if needed later)
  sendOTP: async (email) => {
    return apiCall('/auth/sendotp', {
      method: 'POST',
      body: { email },
    });
  },

  // Forgot password function (if needed later)
  forgotPassword: async (email) => {
    return apiCall('/auth/forgotpassword', {
      method: 'POST',
      body: { email },
    });
  },
};

// Export default API base for other potential APIs
export default {
  authAPI,
};