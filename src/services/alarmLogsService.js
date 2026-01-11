import axiosClient  from '../utils/axiosClient';

export const alarmLogsService = {
  getByAlarmId: async (businessUuid, alarmId) => {
    try {
      // /businesses/{{business_uuid}}/alarmlogs/alarm/b1c2d3e4-0003-4a7b-8c9d-0e1f2a3b4c5d
      const response = await axiosClient.get(`/api/businesses/${businessUuid}/alarmlogs/alarm/${alarmId}`);     
      
      return response?.data?.items || [];
    } catch (error) {
      console.error('Error fetching alarm logs:', error);
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      // 
      const response = await axiosClient.put(`/api/alarmLogs/${id}`, data);
      return response?.data;
    } catch (error) {
      console.error(`Error updating alarm log with id ${id}:`, error);
      throw error;
    }
  }
};
