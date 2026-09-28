/**
 * Centralized REST API Service for Campus Lost & Found
 * Directly communicates with the backend REST endpoints.
 */

const BASE_URL = '/api';

function getAuthHeader() {
  const token = localStorage.getItem('campus_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  let data;
  try {
    data = await response.json();
  } catch (err) {
    data = null;
  }

  if (!response.ok) {
    const errorMsg = data?.message || data?.error || `Request failed with status ${response.status}`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  // Authentication
  registerUser: (userData) =>
    request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  loginUser: (credentials) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  logoutUser: () =>
    request('/auth/logout', {
      method: 'POST',
    }),

  getCurrentUser: () => request('/auth/me'),

  updateProfile: (profileData) =>
    request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  // Metadata
  getCategories: () => request('/meta/categories'),
  getLocations: () => request('/meta/locations'),

  // Items
  getItems: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.append(k, v);
      }
    });
    const qs = query.toString();
    return request(`/items${qs ? `?${qs}` : ''}`);
  },

  getLostItems: (params = {}) => {
    return api.getItems({ ...params, type: 'LOST' });
  },

  getFoundItems: (params = {}) => {
    return api.getItems({ ...params, type: 'FOUND' });
  },

  getItemById: (id) => request(`/items/${id}`),

  createItem: (itemData) =>
    request('/items', {
      method: 'POST',
      body: JSON.stringify(itemData),
    }),

  updateItemStatus: (id, status) =>
    request(`/items/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  deleteItem: (id) =>
    request(`/items/${id}`, {
      method: 'DELETE',
    }),

  // User Reports & Claims
  getMyReports: () => request('/my/reports'),
  getMyClaims: () => request('/my/claims'),

  // Claims
  createClaim: (claimData) =>
    request('/claims', {
      method: 'POST',
      body: JSON.stringify(claimData),
    }),

  getAllClaims: (status) => {
    const qs = status ? `?status=${encodeURIComponent(status)}` : '';
    return request(`/claims${qs}`);
  },

  updateClaimStatus: (id, status, adminNotes = '') =>
    request(`/claims/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, adminNotes }),
    }),

  // Rule-Based Matches
  getPossibleMatches: () => request('/matches'),
  getMatchesForItem: (itemId, type = 'LOST') => request(`/matches/item/${itemId}?type=${type}`),
  updateMatchStatus: (id, status) =>
    request(`/matches/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // Admin Dashboard & Users
  getAdminStats: () => request('/admin/stats'),
  getAdminUsers: () => request('/admin/users'),
  resetDemoDatabase: () =>
    request('/admin/reset-demo', {
      method: 'POST',
    }),

  // Architecture inspector
  getArchitectureInfo: () => request('/architecture/info'),
};
