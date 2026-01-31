import { create } from 'zustand';
import { locationUsersService } from '../services/locationUsersService';

export const useLocationUsersStore = create((set) => ({
  locationUsers: [],
  loadingStates: {
    fetchLocationUsers: false,
    createLocationUser: false
  },
  error: null,
   
    createLocationUser: async (locationData) => {
      set(state => ({
        loadingStates: { ...state.loadingStates, createLocationUser: true }
      }));
      try {
        const response = await locationUsersService.create(locationData);
        //console.log('response on locationUsersStore', response);        
        set(state => ({
          locationUsers: [...state.locationUsers, response.item],
          error: null
        }));
        return response;
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          loadingStates: { ...state.loadingStates, createLocationUser: false }
        }));
      }
    },
    updateLocationUser: async (locationData) => {
      set(state => ({
        loadingStates: { ...state.loadingStates, updateLocationUser: true }
      }));
      try {
        const response = await locationUsersService.update(locationData);
        //console.log('response on locationUsersStore', response);        
        set(state => ({
          locationUsers: [...state.locationUsers, response.item],
          error: null
        }));
        return response;
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          loadingStates: { ...state.loadingStates, updateLocationUser: false }
        }));
      }
    },
     deleteLocationUser: async (businessUuid, businessUserUuid) => {
      set(state => ({
        loadingStates: { ...state.loadingStates, deleteLocationUser: true }
      }));
      try {
        const response = await locationUsersService.delete(businessUuid, businessUserUuid);
        //console.log('response on locationUsersStore', response);        
        set(state => ({
          locationUsers: [...state.locationUsers, response.item],
          error: null
        }));
        return response;
      } catch (error) {
        set({ error: error.message });
        throw error;
      } finally {
        set(state => ({
          loadingStates: { ...state.loadingStates, deleteLocationUser: false }
        }));
      }
    },

  fetchLocationUsers: async (currentUser) => {
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLocationUsers: true },
      error: null
    }));

    try {
      const locationUsers = await locationUsersService.getAllByUserId(currentUser.id);
        
      set(state => ({
        locationUsers,
        loadingStates: { ...state.loadingStates, fetchLocationUsers: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching location users',
        loadingStates: { ...state.loadingStates, fetchLocationUsers: false }
      }));
    }
  }
}));