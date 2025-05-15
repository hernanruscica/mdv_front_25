import { create } from 'zustand';
import { dataService } from '../services/dataService';

export const useDataStore = create((set) => ({
  dataChannel: null,
  loadingStates: {
    fetchData: false,   
  },
  error: null,

  fetchDataChannel: async (nombreTabla, nombreColumna, minutosAtras, tiempoPromedio) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchData: true },
      error: null
    }));
    
    try {
      if (nombreColumna.startsWith('d')) {        
        const data = await dataService.getPorcentages(nombreTabla, nombreColumna, minutosAtras, tiempoPromedio);        
        set(state => ({
          dataChannel: data,
          loadingStates: { ...state.loadingStates, fetchData: false }
        }));
        return data;
    } else if (nombreColumna.startsWith('a')) {        
        const data = await dataService.getAnalogData(nombreTabla, nombreColumna, minutosAtras);        
        set(state => ({
          dataChannel: data,
          loadingStates: { ...state.loadingStates, fetchData: false }
        }));
        return data;
      }
    } catch (error) {
      set(state => ({
        error: 'Error al obtener los datos',
        loadingStates: { ...state.loadingStates, fetchData: false }
      }));
      return null;
    }
  }
}));

