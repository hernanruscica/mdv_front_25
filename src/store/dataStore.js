import { create } from 'zustand';
import { dataService } from '../services/dataService';

export const useDataStore = create((set) => ({
  dataChannel: null,
  dataChannelSecondary: null,
  loadingStates: {
    fetchData: false,   
  },
  error: null,

  fetchDataChannel: async (nombreTabla, nombreColumna, minutosAtras, tiempoPromedio, isSecondary = false) => {
    console.log('parametros de fetchDataChannel en datastore:', nombreTabla, nombreColumna, minutosAtras, tiempoPromedio);        
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchData: true },
      error: null
    }));
    
    try {
      let data = null;
      
      if (nombreColumna.startsWith('d')) {        
        data = await dataService.getPorcentages(nombreTabla, nombreColumna, minutosAtras, tiempoPromedio);        
        
        
        // console.log('Datos obtenidos en datastore', `${nombreTabla}_${nombreColumna}`, data);

      } else if (nombreColumna.startsWith('a')) {        
        data = await dataService.getAnalogData(nombreTabla, nombreColumna, minutosAtras);        
      }

      set(state => ({
        [isSecondary ? 'dataChannelSecondary' : 'dataChannel']: data,
        loadingStates: { ...state.loadingStates, fetchData: false }
      }));

      return data;
    } catch (error) {
      console.error('Error en fetchDataChannel:', error);
      set(state => ({
        error: 'Error al obtener los datos',
        loadingStates: { ...state.loadingStates, fetchData: false }
      }));
      return null;
    }
  },

  clearChannelData: () => {
    set({
      dataChannel: null,
      dataChannelSecondary: null
    });
  }
}));

