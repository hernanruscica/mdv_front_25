import axiosClient from '../utils/axiosClient';

export const dataService = {
  getPorcentages: async (nombreTabla, nombreColumna, minutosAtras, tiempoPromedio) => {
    try {
      const response = await axiosClient.get(
        `/api/data/getporcentages/${nombreTabla}/${nombreColumna}/${minutosAtras}/${tiempoPromedio}`
      );      
      
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  },
  getAnalogData: async (nombreTabla, nombreColumna, minutosAtras) => {
    try {      
      const response = await axiosClient.get(
        `/api/data/getanalog/${nombreTabla}/${nombreColumna}/${minutosAtras}`
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener datos:', error);
      return null;
    }
  },
  getLastData: async (tableName) => {
    try {
      const response = await axiosClient.get(
        `/api/data/getLastData/${tableName}`        
      );
      return response.data.data;
    } catch (error) {
      console.error('Error al obtener el último dato:', error);
      return null;
    }
  }
};