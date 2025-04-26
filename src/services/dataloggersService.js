import axiosClient from '../utils/axiosClient';

export const dataloggersService = {
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
  }
};