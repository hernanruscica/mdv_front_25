import axiosClient from '../utils/axiosClient';

export const usersService = {
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/users');
      return data.users;
    } catch (error) {
      console.error('Get users error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/users/byuser/${userId}`);
      return data.users;
    } catch (error) {
      console.error('Get assigned users error:', error);
      return null;
    }
  },

  getById: async (id) => {
    try {
      const { data } = await axiosClient.get(`/api/users/${id}`);
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  create: async (userData) => {
    try {
      const { data } = await axiosClient.post('/api/users', userData);
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      return null;
    }
  },

  update: async (id, userData) => {
    try {
      const { data } = await axiosClient.put(`/api/users/${id}`, userData);
      return data;
    } catch (error) {
      console.error('Update user error:', error);
      return null;
    }
  },

  delete: async (id) => {
    try {
      const { data } = await axiosClient.delete(`/api/users/${id}`);
      return data;
    } catch (error) {
      console.error('Delete user error:', error);
      return null;
    }
  }
};