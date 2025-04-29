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
  }
};