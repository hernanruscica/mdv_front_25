import axiosClient  from '../utils/axiosClient';

export const alarmLogsService = {
  getByAlarmId: async (alarmId) => {
    try {
      const response = await axiosClient.get(`/api/alarmlogs/byalarm/${alarmId}`);
      return response.data.alarmLogs;
    } catch (error) {
      console.error('Error fetching alarm logs:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      //console.log('Service - Updating alarm log with id:', id, 'and data:', data);
      const response = await axiosClient.put(`/api/alarmLogs/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`Error updating alarm log with id ${id}:`, error);
      throw error;
    }
  }
};
