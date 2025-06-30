import axiosClient from '../utils/axiosClient';

export const solutionsService = {
  // Crear una nueva solución
  createSolution: async (solutionData) => {
    try {
      const response = await axiosClient.post('/api/solutions', solutionData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener soluciones por ID de log de alarma
  getSolutionsByAlarmLogId: async (alarmLogId) => {
    try {
      const response = await axiosClient.get(`/api/solutions/byalarmlog/${alarmLogId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener soluciones por ID de usuario
  getSolutionsByUserId: async (userId) => {
    try {
      const response = await axiosClient.get(`/api/solutions/byuser/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default solutionsService; 