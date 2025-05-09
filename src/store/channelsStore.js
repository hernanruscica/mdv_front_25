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
  },

  fetchChannelById: async (channelId) => {
    if (!channelId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchChannel: true },
      error: null
    }));

    try {
      const channel = await channelsService.getById(channelId);
      
      set(state => ({
        selectedChannel: channel,
        loadingStates: { ...state.loadingStates, fetchChannel: false }
      }));
      
      return channel;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener el canal',
        loadingStates: { ...state.loadingStates, fetchChannel: false }
      }));
      return null;
    }
  },

  createChannel: async (channelData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createChannel: true },
      error: null
    }));
    
    try {
      const response = await channelsService.create(channelData);
      if (response.success) {
        set(state => ({
          channels: [...state.channels, response.channel],
          loadingStates: { ...state.loadingStates, createChannel: false }
        }));
        return response;
      }
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al crear el canal',
        loadingStates: { ...state.loadingStates, createChannel: false }
      }));
      throw error;
    }
  },

  updateChannel: async (channelId, channelData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, updateChannel: true },
      error: null
    }));
    
    try {
      const response = await channelsService.update(channelId, channelData);
      if (response.success) {
        set(state => ({
          channels: state.channels.map(ch => 
            ch.id === channelId ? response.channel : ch
          ),
          loadingStates: { ...state.loadingStates, updateChannel: false }
        }));
        return response;
      }
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al actualizar el canal',
        loadingStates: { ...state.loadingStates, updateChannel: false }
      }));
      throw error;
    }
  }
}));