import { create } from 'zustand';
import { locationsService } from '../services/locationsService';

export const useLocationsStore = create((set) => ({
  locations: [],
  selectedLocation: null,
  loadingStates: {
    fetchLocations: false,
    fetchLocation: false,
  },
  error: null,

  fetchLocations: async (currentUser) => {
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLocations: true },
      error: null
    }));

    try {
      const locations = currentUser.espropietario === 1 
        ? await locationsService.getAll()
        : await locationsService.getAllById(currentUser.id);
        
      set(state => ({
        locations,
        loadingStates: { ...state.loadingStates, fetchLocations: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching locations',
        loadingStates: { ...state.loadingStates, fetchLocations: false }
      }));
    }
  },

  fetchLocationById: async (locationId) => {
    if (!locationId) return null;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLocation: true },
      error: null
    }));

    try {
      const location = await locationsService.getById(locationId);
      
      set(state => ({
        selectedLocation: location,
        loadingStates: { ...state.loadingStates, fetchLocation: false }
      }));

      return location;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener la ubicación',
        loadingStates: { ...state.loadingStates, fetchLocation: false }
      }));
      return null;
    }
  }
}));