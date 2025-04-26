import axiosClient from '../utils/axiosClient';

export const channelsService = {
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/channels');
      return data.channels;
    } catch (error) {
      console.error('Get channels error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/channels/byuser/${userId}`);
      return data.channels;
    } catch (error) {
      console.error('Get assigned channels error:', error);
      return null;
    }
  }
};