// Frontend Integration Example for BoldAdventures
// This file shows how to integrate the backend API with the frontend

// ==========================================
// Configuration
// ==========================================
const API_BASE_URL = 'http://localhost:5000/api'; // Change to your deployed URL in production

// ==========================================
// Authentication Helper Functions
// ==========================================

/**
 * Store tokens in localStorage
 */
function storeTokens(accessToken, refreshToken) {
  localStorage.setItem('accessToken', accessToken);
  localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Get access token from localStorage
 */
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

/**
 * Clear tokens from localStorage
 */
function clearTokens() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
}

/**
 * Check if user is logged in
 */
function isLoggedIn() {
  return !!getAccessToken();
}

// ==========================================
// API Call Helpers
// ==========================================

/**
 * Make authenticated API request
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAccessToken();
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    // Handle token expiration
    if (response.status === 401 && data.message.includes('expired')) {
      // Try to refresh token
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        // Retry the original request
        return apiRequest(endpoint, options);
      } else {
        // Refresh failed, logout user
        logout();
        window.location.href = '/login.html';
      }
    }

    if (!response.ok) {
      throw new Error(data.message || 'API request failed');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

/**
 * Refresh access token
 */
async function refreshAccessToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) return false;

    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies
    });

    const data = await response.json();

    if (data.success && data.data.accessToken) {
      localStorage.setItem('accessToken', data.data.accessToken);
      return true;
    }

    return false;
  } catch (error) {
    console.error('Token refresh error:', error);
    return false;
  }
}

// ==========================================
// Authentication API Functions
// ==========================================

/**
 * Register new user
 */
async function register(name, email, password) {
  try {
    const data = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    if (data.success) {
      storeTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.user;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Login user
 */
async function login(email, password) {
  try {
    const data = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (data.success) {
      storeTokens(data.data.accessToken, data.data.refreshToken);
      return data.data.user;
    }
  } catch (error) {
    throw error;
  }
}

/**
 * Logout user
 */
async function logout() {
  try {
    await apiRequest('/auth/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    clearTokens();
  }
}

/**
 * Get current user profile
 */
async function getCurrentUser() {
  try {
    const data = await apiRequest('/auth/me');
    return data.data.user;
  } catch (error) {
    throw error;
  }
}

/**
 * Update user profile
 */
async function updateProfile(name, email) {
  try {
    const data = await apiRequest('/auth/me', {
      method: 'PUT',
      body: JSON.stringify({ name, email }),
    });
    return data.data.user;
  } catch (error) {
    throw error;
  }
}

// ==========================================
// Tours API Functions
// ==========================================

/**
 * Get all tours with optional filters
 */
async function getTours(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/tours${queryParams ? `?${queryParams}` : ''}`;
  
  try {
    const data = await apiRequest(endpoint);
    return data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get featured tours
 */
async function getFeaturedTours() {
  try {
    const data = await apiRequest('/tours/featured');
    return data.data.tours;
  } catch (error) {
    throw error;
  }
}

/**
 * Get single tour by ID
 */
async function getTour(id) {
  try {
    const data = await apiRequest(`/tours/${id}`);
    return data.data.tour;
  } catch (error) {
    throw error;
  }
}

/**
 * Create new tour (Admin/Guide only)
 */
async function createTour(tourData) {
  try {
    const data = await apiRequest('/tours', {
      method: 'POST',
      body: JSON.stringify(tourData),
    });
    return data.data.tour;
  } catch (error) {
    throw error;
  }
}

// ==========================================
// Newsletter API Functions
// ==========================================

/**
 * Subscribe to newsletter
 */
async function subscribeNewsletter(email) {
  try {
    const data = await apiRequest('/newsletter/subscribe', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    return data;
  } catch (error) {
    throw error;
  }
}

// ==========================================
// Booking API Functions
// ==========================================

/**
 * Create a new booking
 */
async function createBooking(tourId, startDate, numberOfPeople, notes = '') {
  try {
    const data = await apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify({ tourId, startDate, numberOfPeople, notes }),
    });
    return data.data.booking;
  } catch (error) {
    throw error;
  }
}

/**
 * Get user's bookings
 */
async function getMyBookings(filters = {}) {
  const queryParams = new URLSearchParams(filters).toString();
  const endpoint = `/bookings/my-bookings${queryParams ? `?${queryParams}` : ''}`;
  
  try {
    const data = await apiRequest(endpoint);
    return data.data;
  } catch (error) {
    throw error;
  }
}

/**
 * Get single booking by ID
 */
async function getBooking(id) {
  try {
    const data = await apiRequest(`/bookings/${id}`);
    return data.data.booking;
  } catch (error) {
    throw error;
  }
}

/**
 * Cancel booking
 */
async function cancelBooking(id, reason = '') {
  try {
    const data = await apiRequest(`/bookings/${id}/cancel`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    });
    return data.data.booking;
  } catch (error) {
    throw error;
  }
}

// ==========================================
// UI Update Examples
// ==========================================

/**
 * Example: Update navbar based on login status
 */
function updateNavbar() {
  const navIcons = document.querySelector('.nav-icons');
  
  if (isLoggedIn()) {
    // Add user menu
    navIcons.innerHTML = `
      <li>
        <a href="#" id="user-profile" class="nav-icon">
          <i class="fas fa-user"></i>
        </a>
      </li>
      <li>
        <a href="#" id="logout-btn" class="nav-icon">
          <i class="fas fa-sign-out-alt"></i>
        </a>
      </li>
    `;
    
    // Add logout handler
    document.getElementById('logout-btn').addEventListener('click', async (e) => {
      e.preventDefault();
      await logout();
      window.location.href = '/';
    });
  } else {
    // Add login/signup buttons
    navIcons.innerHTML += `
      <li>
        <a href="/login.html" class="nav-icon">
          <i class="fas fa-sign-in-alt"></i>
        </a>
      </li>
    `;
  }
}

/**
 * Example: Handle newsletter form submission
 */
function setupNewsletterForm() {
  const form = document.querySelector('.contact-form');
  
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const emailInput = form.querySelector('input[type="email"]');
      const email = emailInput.value;
      
      try {
        await subscribeNewsletter(email);
        alert('Successfully subscribed to newsletter!');
        emailInput.value = '';
      } catch (error) {
        alert('Failed to subscribe: ' + error.message);
      }
    });
  }
}

/**
 * Example: Load and display featured tours
 */
async function displayFeaturedTours() {
  try {
    const tours = await getFeaturedTours();
    const container = document.querySelector('.featured-center');
    
    if (container && tours.length > 0) {
      // Tours already displayed in HTML, but you could update with fresh data
      console.log('Featured tours loaded:', tours);
      // Update tour data dynamically if needed
    }
  } catch (error) {
    console.error('Failed to load featured tours:', error);
  }
}

// ==========================================
// Initialize
// ==========================================

// Call these when page loads
document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
  setupNewsletterForm();
  displayFeaturedTours();
});

// Export functions for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    register,
    login,
    logout,
    getCurrentUser,
    updateProfile,
    getTours,
    getFeaturedTours,
    getTour,
    subscribeNewsletter,
    createBooking,
    getMyBookings,
    getBooking,
    cancelBooking,
    isLoggedIn,
  };
}
