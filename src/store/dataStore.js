import { create } from 'zustand';
import { dataService } from '../services/dataService';

export const useDataStore = create((set) => ({
  channelUsage: null,
  dataloggerUsage: null,
  channelAllRegistersData: null,  
  channelDailyData: null,
  channelWeeklyData: null,
  energyIncidents: null,
  loadingStates: {
    fetchChannelUsage: false,
    fetchDataloggerUsage: false,
    fetchAllRegistersChannelData: false,   
    fetchDailyChannelData: false,
    fetchWeeklyChannelData: false,
    fetchEnergyIncidents: false
  },
  error: null,
  
  fetchChannelUsage: async (businessUuid, dataloggerUuid, channelUuid) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchChannelUsage: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelUsage(businessUuid, dataloggerUuid, channelUuid);          
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

  fetchDataloggerUsage: async (businessUuid, dataloggerUuid) => {       
    //console.log('desde el store, dataloggerUuid', dataloggerUuid);
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDataloggerUsage: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getDataloggerUsage(businessUuid, dataloggerUuid);          
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

  fetchAllRegistersChannelData: async (businessUuid, channelUuid, start, end) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAllRegistersChannelData: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelAllRegisters(businessUuid, channelUuid, start, end);          
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

  fetchDailyChannelData: async (businessUuid, channelUuid, start, end) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchDailyChannelData: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelDaily(businessUuid, channelUuid, start, end);          
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
  
  fetchWeeklyChannelData: async (businessUuid, channelUuid, start, end) => {       
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchWeeklyChannelData: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getChannelWeekly(businessUuid, channelUuid, start, end);          
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

  fetchEnergyIncidents: async (businessUuid, dataloggerUuid, start, end) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchEnergyIncidents: true },
      error: null
    }));
    
    try {    
        const data = await dataService.getEnergyIncidents(businessUuid, dataloggerUuid, start, end);
      set(state => ({
        energyIncidents: data,
        loadingStates: { ...state.loadingStates, fetchEnergyIncidents: false }
      }));
      return data;
    } catch (error) {
      console.error('Error en fetchEnergyIncidents:', error);
      set(state => ({
        error: 'Error al obtener incidentes de energía',
        loadingStates: { ...state.loadingStates, fetchEnergyIncidents: false }
      }));
      return null;
    }
  },
}));

