import axiosClient from '../utils/axiosClient';

export const usersService = {
  getAll: async (businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/users/`);
      return data.users;
    } catch (error) {
      console.error('Get users error:', error);
      return null;
    }
  },

  getAllById: async (businessUuid) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${businessUuid}/users/`);
      return data.users;
    } catch (error) {
      console.error('Get assigned users error:', error);
      return null;
    }
  },

  getById: async (uuid, uuidOrigin) => {    
    
    try {
      const { data } = await axiosClient.get(`/api/businesses/${uuidOrigin}/users/${uuid}`);
      return data.user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  },

  create: async (userData) => {
    try {
      const { data } = await axiosClient.uploadFile('/api/users', userData);
      return data;
    } catch (error) {
      console.error('Create user error:', error);
      throw error;
    }
  },

  update: async (id, userData) => {
    try {
      const { data } = await axiosClient.put(`/api/users/${id}`, userData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
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
