import { create } from 'zustand';
import { dataloggersService } from '../services/dataloggersService';

export const useDataloggersStore = create((set) => ({
  dataloggers: [],
  selectedDatalogger: null,
  loadingStates: {
    fetchDataloggers: false,
    fetchDatalogger: false,
  },
  error: null,

  fetchDataloggers: async (currentUser) => {
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDataloggers: true },
      error: null
    }));

    try {
      const dataloggers = currentUser.espropietario === 1 
        ? await dataloggersService.getAll()
        : await dataloggersService.getAllById(currentUser.id);
        
      set(state => ({
        dataloggers,
        loadingStates: { ...state.loadingStates, fetchDataloggers: false }
      }));
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

  fetchDataloggerById: async (id) => {
    if (!id) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDatalogger: true },
      error: null
    }));

    try {
      const datalogger = await dataloggersService.getById(id);
        
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
  }
}));