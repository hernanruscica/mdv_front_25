import { create } from 'zustand';
import { channelsService } from '../services/channelsService';

export const useChannelsStore = create((set) => ({
  channels: [],
  selectedChannel: null,
  loadingStates: {
    fetchChannels: false,
    fetchChannel: false,
  },
  error: null,

  fetchChannels: async (currentUser) => {
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchChannels: true },
      error: null
    }));

    try {
      const channels = currentUser.espropietario === 1 
        ? await channelsService.getAll()
        : await channelsService.getAllById(currentUser.id);
        
      set(state => ({
        channels,
        loadingStates: { ...state.loadingStates, fetchChannels: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching channels',
        loadingStates: { ...state.loadingStates, fetchChannels: false }
      }));
    }
  }
}));