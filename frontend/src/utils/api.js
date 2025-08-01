const API_BASE_URL = 'https://thursdate-backend.onrender.com';

// Helper function to get auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper function to set auth token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Helper function to remove auth token from localStorage
const removeToken = () => localStorage.removeItem('token');

// Helper function to make authenticated requests
const authRequest = async (url, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found');
  }

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  // Register new user
  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },

  // Login user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },

  // Logout user
  logout: () => {
    removeToken();
  },

  // Check if user is authenticated
  isAuthenticated: () => {
    return !!getToken();
  },

  // Delete account
  deleteAccount: async () => {
    return authRequest('/auth/account', {
      method: 'DELETE',
    });
  },
};

// User Profile API
export const userAPI = {
  // Get user profile
  getProfile: async () => {
    return authRequest('/user/profile');
  },

  // Save user profile (for onboarding)
  saveProfile: async (profileData) => {
    return authRequest('/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Update user profile
  updateProfile: async (profileData) => {
    return authRequest('/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Admin API
export const adminAPI = {
  // Get all users
  getAllUsers: async () => {
    return authRequest('/admin/users');
  },

  // Get waitlisted users
  getWaitlist: async () => {
    return authRequest('/admin/waitlist');
  },

  // Get user details
  getUserDetails: async (userId) => {
    return authRequest(`/admin/users/${userId}`);
  },

  // Approve/Reject user
  updateUserApproval: async (userId, approval, reason = '') => {
    return authRequest(`/admin/users/${userId}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ approval, reason }),
    });
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    return authRequest('/admin/dashboard');
  },
};

// Image Upload API
export const uploadAPI = {
  // Upload profile picture
  uploadProfilePicture: async (file) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },

  // Upload lifestyle image
  uploadLifestyleImage: async (file) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/upload/lifestyle-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Upload failed');
    }

    return response.json();
  },
}; 