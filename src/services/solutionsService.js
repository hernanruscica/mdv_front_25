import axiosClient from '../utils/axiosClient';

export const solutionsService = {
  // Crear una nueva solución
  createSolution: async (businessUuid, solutionData) => {
    try {      
      const response = await axiosClient.post(`/api/businesses/${businessUuid}/solutions`, solutionData);
      //console.log('response.data de solutionservice create', response.data.item);
      
      return response.data.item;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener soluciones por ID de log de alarma  
  // /businesses/4e329ada-8511-4bfa-8d44-57a0ca4fd80c/solutions/alarmlogs/81625590-d9fa-457e-b6fb-1194c45aa37d
  getSolutionsByAlarmLogId: async (businessUuid, alarmLogId) => {
    try {
      const response = await axiosClient.get(`/api/businesses/${businessUuid}/solutions/alarmlogs/${alarmLogId}`);
      //console.log('response solutionsService', response.data.items);
      
      return response.data.items;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Obtener soluciones por ID de usuario - todavia no esta creado en el backend
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