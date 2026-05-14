import axiosClient from '../utils/axiosClient';

export const backendLogsService = {
  getAll: async (params = {}) => {
    try {
      const { data } = await axiosClient.get('/api/backendlogs', { params });
      if (data?.items) {
        data.items = data.items.map(item => ({
          ...item,
          created_at: new Date(
            new Date(item.created_at).getTime() - 6 * 60 * 60 * 1000
          ).toISOString()
        }));
      }
      return data;
    } catch (error) {
      console.error('Error fetching backend logs:', error);
      throw error;
    }
  },

  getById: async (uuid) => {
    try {
      const { data } = await axiosClient.get(`/api/backendlogs/${uuid}`);
      if (data?.item) {
        data.item.created_at = new Date(
          new Date(data.item.created_at).getTime() - 6 * 60 * 60 * 1000
        ).toISOString();
      }
      return data;
    } catch (error) {
      console.error('Error fetching backend log by id:', error);
      throw error;
    }
  },
};
