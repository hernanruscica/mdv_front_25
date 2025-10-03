import axiosClient from '../utils/axiosClient';

export const locationsService = {
  create: async (locationData) => {
    try {
      const { data } = await axiosClient.uploadFile('/api/businesses', locationData);
      return data;
    } catch (error) {
      console.error('Create location error:', error);
      throw error;
    }
  },

  update: async (locationId, locationData) => {
    try {
      const { data } = await axiosClient.put(`/api/businesses/${locationId}`, locationData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return data;
    } catch (error) {
      console.error('Update location error:', error);
      throw error;
    }
  },

  delete: async (locationId) => {
    try {
      const { data } = await axiosClient.delete(`/api/locations/${locationId}`);
      return data;
    } catch (error) {
      console.error('Delete location error:', error);
      throw error;
    }
  },
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/businesses');
      return data.businesses;
    } catch (error) {
      console.error('Get locations error:', error);
      return null;
    }
  },

  getAllById: async () => {
    try {
      const { data } = await axiosClient.get(`/api/businesses`);
      return data.businesses;
    } catch (error) {
      console.error('Get assigned locations error:', error);
      return null;
    }
  },

  getById: async (locationId) => {
    try {
      const { data } = await axiosClient.get(`/api/businesses/${locationId}`);        
      return data.business;
    } catch (error) {
      console.error('Get location by id error:', error);
      return null;
    }
  },

};
