import { create } from 'zustand';
import { locationsService } from '../services/locationsService';

export const useLocationsStore = create((set, get) => ({
  locations: [],
  selectedLocation: null,
  error: null,
  loadingStates: {
    fetchLocations: false,
    fetchLocation: false,
    createLocation: false,
    updateLocation: false,
    deleteLocation: false
  },
  
  // Crear una nueva ubicación
  createLocation: async (locationData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createLocation: true }
    }));
    try {
      const response = await locationsService.create(locationData);
      set(state => ({
        locations: [...state.locations, response.location],
        error: null
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, createLocation: false }
      }));
    }
  },

  // Actualizar una ubicación
  updateLocation: async (locationId, locationData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, updateLocation: true }
    }));
    try {
      const response = await locationsService.update(locationId, locationData);
      set(state => ({
        locations: state.locations.map(loc => 
          loc.id === locationId ? response.location : loc
        ),
        selectedLocation: response.location,
        error: null
      }));
      return response;
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, updateLocation: false }
      }));
    }
  },

  // Eliminar una ubicación
  deleteLocation: async (locationId) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, deleteLocation: true }
    }));
    try {
      await locationsService.delete(locationId);
      set(state => ({
        locations: state.locations.filter(loc => loc.id !== locationId),
        error: null
      }));
    } catch (error) {
      set({ error: error.message });
      throw error;
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, deleteLocation: false }
      }));
    }
  },
  // Obtener todas las ubicaciones
  fetchLocations: async (user) => {
    //console.log('Fetching locations for user:', user);
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLocations: true }
    }));
    try {
      if (user && user.isOwner == 1){
        
        const locations = await locationsService.getAll();
        set({ locations, error: null });
      }else{
        const locations = await locationsService.getAllById();
        set({ locations, error: null });
      }
    } catch (error) {
      set({ error: error.message });
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, fetchLocations: false }
      }));
    }
  },

  // Obtener una ubicación por ID
  fetchLocationById: async (locationId) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLocation: true }
    }));
    try {
      const location = await locationsService.getById(locationId);
      set({ selectedLocation: location, error: null });
      return location;
    } catch (error) {
      set({ error: error.message });
    } finally {
      set(state => ({
        loadingStates: { ...state.loadingStates, fetchLocation: false }
      }));
    }
  },

}));