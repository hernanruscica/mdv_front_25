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
  }
}));