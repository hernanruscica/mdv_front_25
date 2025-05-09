import axiosClient from '../utils/axiosClient';

export const dataloggersService = {
  create: async (formData) => {
    try {
      const { data } = await axiosClient.uploadFile('/api/dataloggers', formData);
      return data;
    } catch (error) {
      console.error('Error creating datalogger:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/dataloggers');
      return data.dataloggers;
    } catch (error) {
      console.error('Get dataloggers error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/dataloggers/byuser/${userId}`);
      return data.dataloggers;
    } catch (error) {
      console.error('Get assigned dataloggers error:', error);
      return null;
    }
  },

  getAllByLocation: async (locationId) => {
    try {
      const { data } = await axiosClient.get(`/api/dataloggers/bylocation/${locationId}`);
      return data.dataloggers;
    } catch (error) {
      console.error('Get location dataloggers error:', error);
      return null;
    }
  },

  getById: async (id) => {
    try {
      const { data } = await axiosClient.get(`/api/dataloggers/${id}`);
      return data.datalogger;
    } catch (error) {
      console.error('Get datalogger by id error:', error);
      return null;
    }
  },

  update: async (id, formData) => {
    try {
      const { data } = await axiosClient.put(`/api/dataloggers/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      console.error('Error updating datalogger:', error);
      throw error;
    }
  }
};