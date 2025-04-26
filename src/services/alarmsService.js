import axiosClient from '../utils/axiosClient';

export const alarmsService = {
  getAll: async () => {
    try {
      const { data } = await axiosClient.get('/api/alarms');
      return data.alarms;
    } catch (error) {
      console.error('Get alarms error:', error);
      return null;
    }
  },

  getAllById: async (userId) => {
    try {
      const { data } = await axiosClient.get(`/api/alarmusers/alarmsbyuser/${userId}`);
      return data.alarms;
    } catch (error) {
      console.error('Get assigned alarms error:', error);
      return null;
    }
  }
};