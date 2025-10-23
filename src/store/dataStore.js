import { create } from 'zustand';
import { dataService } from '../services/dataService';

export const useDataStore = create((set) => ({
  dataChannel: null,
  dataChannelSecondary: null,
  loadingStates: {
    fetchData: false,   
  },
  error: null,

  fetchDataChannel: async (table_name, column_name, minutosAtras, tiempoPromedio, isSecondary = false) => {
    //console.log('parametros de fetchDataChannel en datastore:', table_name, column_name, minutosAtras, tiempoPromedio);        
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchData: true },
      error: null
    }));
    
    try {
      let data = null;
      
      if (column_name.startsWith('d')) {        
        data = await dataService.getPorcentages(table_name, column_name, minutosAtras, tiempoPromedio);        
        
        
        // console.log('Datos obtenidos en datastore', `${table_name}_${column_name}`, data);

      } else if (column_name.startsWith('a')) {        
        data = await dataService.getAnalogData(table_name, column_name, minutosAtras);        
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

