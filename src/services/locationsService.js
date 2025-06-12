import axiosClient from '../utils/axiosClient';

export const locationsService = {
  create: async (locationData) => {
    try {
      // Cambiamos post por uploadFile para manejar correctamente el FormData
      const { data } = await axiosClient.uploadFile('/api/locations', locationData);
      return data;
    } catch (error) {
      console.error('Create location error:', error);
      throw error;
    }
  },

  update: async (locationId, locationData) => {
    try {
      const { data } = await axiosClient.put(`/api/locations/${locationId}`, locationData, {
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
      const { data } = await axiosClient.get('/api/locations');
      return data.locations;
    } catch (error) {
      console.error('Get locations error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/locationsusers/locationsbyuser/${userId}`);
      return data.locationUserData;
    } catch (error) {
      console.error('Get assigned locations error:', error);
      return null;
    }
  },

  getById: async (locationId) => {
    try {
      const { data } = await axiosClient.get(`/api/locations/${locationId}`);      
      return data.location;
    } catch (error) {
      console.error('Get location by id error:', error);
      return null;
    }
  },

};