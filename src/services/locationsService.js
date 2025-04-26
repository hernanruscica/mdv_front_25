import axiosClient from '../utils/axiosClient';

export const locationsService = {
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
      return data.locations;
    } catch (error) {
      console.error('Get assigned locations error:', error);
      return null;
    }
  }
};