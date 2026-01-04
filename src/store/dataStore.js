import { create } from 'zustand';
import { dataService } from '../services/dataService';

export const useDataStore = create((set) => ({
  channelUsage: null,
  dataloggerUsage: null,
  channelAllRegistersData: null,  
  channelDailyData: null,
  channelWeeklyData: null,
  loadingStates: {
    fetchChannelUsage: false,
    fetchDataloggerUsage: false,
    fetchAllRegistersChannelData: false,   
    fetchDailyChannelData: false,
    fetchWeeklyChannelData: false
  },
  error: null,
  
  fetchChannelUsage: async (dataloggerUuid, channelUuid) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchChannelUsage: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelUsage(dataloggerUuid, channelUuid);          
      set(state => ({
        channelUsage: data,
        loadingStates: { ...state.loadingStates, fetchChannelUsage: false }
      }));

      return data;
    } catch (error) {
      console.error('Error en fetchChannelUsage:', error);
      set(state => ({
        error: 'Error al obtener los datos - fetchChannelUsage',
        loadingStates: { ...state.loadingStates, fetchChannelUsage: false }
      }));
      return null;
    }
  },

  fetchDataloggerUsage: async (dataloggerUuid) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDataloggerUsage: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getDataloggerUsage(dataloggerUuid);          
      set(state => ({
        dataloggerUsage: data,
        loadingStates: { ...state.loadingStates, fetchDataloggerUsage: false }
      }));

      return data;
    } catch (error) {
      console.error('Error en fetchDataloggerUsage:', error);
      set(state => ({
        error: 'Error al obtener los datos - fetchDataloggerUsage',
        loadingStates: { ...state.loadingStates, fetchDataloggerUsage: false }
      }));
      return null;
    }
  },

  fetchAllRegistersChannelData: async (channelUuid, start, end) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAllRegistersChannelData: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelAllRegisters(channelUuid, start, end);          
      set(state => ({
        channelAllRegistersData: data,
        loadingStates: { ...state.loadingStates, fetchAllRegistersChannelData: false }
      }));

      return data;
    } catch (error) {
      console.error('Error en fetchAllRegistersChannelData:', error);
      set(state => ({
        error: 'Error al obtener los datos - fetchAllRegistersChannelData',
        loadingStates: { ...state.loadingStates, fetchAllRegistersChannelData: false }
      }));
      return null;
    }
  },

  fetchDailyChannelData: async (channelUuid, start, end) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDailyChannelData: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelDaily(channelUuid, start, end);          
      set(state => ({
        channelDailyData: data,
        loadingStates: { ...state.loadingStates, fetchDailyChannelData: false }
      }));

      return data;
    } catch (error) {
      console.error('Error en fetchDailyChannelData:', error);
      set(state => ({
        error: 'Error al obtener los datos - fetchDailyChannelData',
        loadingStates: { ...state.loadingStates, fetchDailyChannelData: false }
      }));
      return null;
    }
  },
  
  fetchWeeklyChannelData: async (channelUuid, start, end) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchWeeklyChannelData: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelWeekly(channelUuid, start, end);          
      set(state => ({
        channelWeeklyData: data,
        loadingStates: { ...state.loadingStates, fetchWeeklyChannelData: false }
      }));

      return data;
    } catch (error) {
      console.error('Error en fetchWeeklyChannelData:', error);
      set(state => ({
        error: 'Error al obtener los datos',
        loadingStates: { ...state.loadingStates, fetchWeeklyChannelData: false }
      }));
      return null;
    }
  },
/*
  clearChannelData: () => {
    set({
      dataChannel: null,
      dataChannelSecondary: null
    });
  }*/
}));

