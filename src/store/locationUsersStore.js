import { create } from 'zustand';
import { locationUsersService } from '../services/locationUsersService';

export const useLocationUsersStore = create((set) => ({
  locationUsers: [],
  loadingStates: {
    fetchLocationUsers: false
  },
  error: null,

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