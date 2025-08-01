// Use Vite's environment variable to get the base URL
// This allows the code to work in both development and production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Helper function to get the auth token from localStorage
const getToken = () => localStorage.getItem('token');

// Helper function to set the auth token in localStorage
const setToken = (token) => localStorage.setItem('token', token);

// Helper function to remove the auth token from localStorage
const removeToken = () => localStorage.removeItem('token');

/**
 * A general-purpose fetch wrapper for authenticated requests.
 * It automatically includes the authorization token and handles common errors.
 * @param {string} endpoint The API endpoint to call (e.g., '/user/profile').
 * @param {object} options Fetch options like method, headers, etc.
 * @returns {Promise<any>} The parsed JSON response.
 */
const authRequest = async (endpoint, options = {}) => {
  const token = getToken();
  if (!token) {
    throw new Error('No authentication token found. Please log in.');
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed with unknown error.' }));
    throw new Error(error.error || `Request failed with status ${response.status}`);
  }

  return response.json();
};

// Authentication API
export const authAPI = {
  // Register a new user
  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Registration failed with unknown error.' }));
      throw new Error(error.error || `Registration failed with status ${response.status}`);
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },

  // Log in a user
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Login failed with unknown error.' }));
      throw new Error(error.error || `Login failed with status ${response.status}`);
    }

    const data = await response.json();
    setToken(data.token);
    return data;
  },

  // Log out a user by removing the token
  logout: () => {
    removeToken();
  },

  // Check if a user is authenticated by verifying the existence of a token
  isAuthenticated: () => {
    return !!getToken();
  },

  // Delete the user's account
  deleteAccount: async () => {
    return authRequest('/api/auth/account', {
      method: 'DELETE',
    });
  },
};

// User Profile API
export const userAPI = {
  // Get the authenticated user's profile
  getProfile: async () => {
    return authRequest('/api/user/profile');
  },

  // Save a new user profile (onboarding)
  saveProfile: async (profileData) => {
    return authRequest('/api/user/profile', {
      method: 'POST',
      body: JSON.stringify(profileData),
    });
  },

  // Update the authenticated user's profile
  updateProfile: async (profileData) => {
    return authRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Admin API
export const adminAPI = {
  // Get a list of all users
  getAllUsers: async () => {
    return authRequest('/api/admin/users');
  },

  // Get a list of waitlisted users
  getWaitlist: async () => {
    return authRequest('/api/admin/waitlist');
  },

  // Get details for a specific user
  getUserDetails: async (userId) => {
    return authRequest(`/api/admin/users/${userId}`);
  },

  // Update a user's approval status
  updateUserApproval: async (userId, approval, reason = '') => {
    return authRequest(`/api/admin/users/${userId}/approval`, {
      method: 'PUT',
      body: JSON.stringify({ approval, reason }),
    });
  },

  // Get dashboard statistics
  getDashboardStats: async () => {
    return authRequest('/api/admin/dashboard');
  },
};

// Image Upload API
export const uploadAPI = {
  // Upload a user's profile picture
  uploadProfilePicture: async (file) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/profile-picture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed with unknown error.' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },

  // Upload a lifestyle image for a user
  uploadLifestyleImage: async (file) => {
    const token = getToken();
    if (!token) {
      throw new Error('No authentication token found. Please log in.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/api/upload/lifestyle-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Upload failed with unknown error.' }));
      throw new Error(error.error || `Upload failed with status ${response.status}`);
    }

    return response.json();
  },
};