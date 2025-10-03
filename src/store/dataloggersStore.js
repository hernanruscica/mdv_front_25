import { create } from 'zustand';
import { dataloggersService } from '../services/dataloggersService';

export const useDataloggersStore = create((set) => ({
  dataloggers: [],
  selectedDatalogger: null,
  loadingStates: {
    fetchDataloggers: false,
    fetchDatalogger: false,
    createDatalogger: false,
    fetchDataloggersByLocation: false, 
    fetchDataloggerById: false, 
    updateDatalogger: false
  },
  error: null,

  createDatalogger: async (dataloggerData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createDatalogger: true }
    }));
    try {
      const response = await dataloggersService.create(dataloggerData);
      set(state => ({
        dataloggers: [...state.dataloggers, response.datalogger],
        error: null
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, createDatalogger: false }
      }));
    }
  },

  fetchDataloggers: async (currentUser, businessUuid) => {
    //console.log('fetchDataloggers')
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDataloggers: true },
      error: null
    }));

    try {     
      const dataloggers = await dataloggersService.getAll(businessUuid);
      set(state => ({
        dataloggers,
        loadingStates: { ...state.loadingStates, fetchDataloggers: false }
      }));
      return dataloggers;
    } catch (error) {
      set(state => ({
        error: 'Error fetching dataloggers',
        loadingStates: { ...state.loadingStates, fetchDataloggers: false }
      }));
    }
  },

  fetchDataloggersByLocation: async (locationId) => {
    if (!locationId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDataloggers: true },
      error: null
    }));

    try {
      const dataloggers = await dataloggersService.getAllByLocation(locationId);
        
      set(state => ({
        dataloggers,
        loadingStates: { ...state.loadingStates, fetchDataloggers: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error al obtener los dataloggers de la ubicación',
        loadingStates: { ...state.loadingStates, fetchDataloggers: false }
      }));
    }
  },

  fetchDataloggerById: async (id, businessUuid) => {
    if (!id) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDatalogger: true },
      error: null
    }));

    try {
      const datalogger = await dataloggersService.getById(id, businessUuid);
     
      set(state => ({
        selectedDatalogger: datalogger,
        loadingStates: { ...state.loadingStates, fetchDatalogger: false }
      }));

      return datalogger;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener el datalogger',
        loadingStates: { ...state.loadingStates, fetchDatalogger: false }
      }));
      return null;
    }
  },
  
  updateDatalogger: async (id, dataloggerData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, updateDatalogger: true }
    }));
    try {
      const response = await dataloggersService.update(id, dataloggerData);
      set(state => ({
        dataloggers: state.dataloggers.map(d => 
          d.id === id ? response.datalogger : d
        ),
        error: null
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, updateDatalogger: false }
      }));
    }
  }
}));