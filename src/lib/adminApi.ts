import api from './api';

// Admin API service
const adminApi = {
  // Get admin headers with JWT token
  getHeaders: () => {
    const adminToken = localStorage.getItem('adminToken');
    return {
      'Authorization': `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    };
  },

  // Dashboard statistics
  getStats: async () => {
    const response = await api.get('/admin/stats', {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  // Users
  getUsers: async () => {
    const response = await api.get('/admin/users', {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  getUser: async (id: string) => {
    const response = await api.get(`/admin/users/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  deleteUser: async (id: string) => {
    const response = await api.delete(`/admin/users/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  // Properties
  getProperties: async () => {
    const response = await api.get('/admin/properties', {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  getProperty: async (id: string) => {
    const response = await api.get(`/admin/properties/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  deleteProperty: async (id: string) => {
    const response = await api.delete(`/admin/properties/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  // Bookings
  getBookings: async () => {
    const response = await api.get('/admin/bookings', {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  getBooking: async (id: string) => {
    const response = await api.get(`/admin/bookings/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  deleteBooking: async (id: string) => {
    const response = await api.delete(`/admin/bookings/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  // Reviews
  getReviews: async () => {
    const response = await api.get('/admin/reviews', {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  getReview: async (id: string) => {
    const response = await api.get(`/admin/reviews/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },

  deleteReview: async (id: string) => {
    const response = await api.delete(`/admin/reviews/${id}`, {
      headers: adminApi.getHeaders(),
    });
    return response.data;
  },
};

export default adminApi; 