import { create } from 'zustand';
import { alarmsService } from '../services/alarmsService';

export const useAlarmsStore = create((set) => ({
  alarms: [],
  selectedAlarm: null,
  loadingStates: {
    fetchAlarms: false,
    fetchAlarm: false,
    fetchAlarmsByUser: false
  },
  error: null,

  fetchAlarms: async (currentUser) => {
    if (!currentUser) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarms: true },
      error: null
    }));

    try {
      const alarms =  await alarmsService.getAllById(currentUser.id);
     // console.log('alarmas del usuario', alarms)  
      set(state => ({
        alarms,
        loadingStates: { ...state.loadingStates, fetchAlarms: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching alarms',
        loadingStates: { ...state.loadingStates, fetchAlarms: false }
      }));
    }
  },
  fetchAlarmsByUser: async (currentUser) => {
    console.log("desde el store alarm:", currentUser)
    if (!currentUser) return;
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarmsByUser: true },
      error: null
    }));

    try {
      const alarms =  await alarmsService.getAllById(currentUser.id);
        
      set(state => ({
        alarms,
        loadingStates: { ...state.loadingStates, fetchAlarmsByUser: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching alarms by User',
        loadingStates: { ...state.loadingStates, fetchAlarmsByUser: false }
      }));
    }
  },
  
  fetchAlarmsByLocation: async (locationId) => {
    if (!locationId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarms: true },
      error: null
    }));

    try {
      const alarms = await alarmsService.getAllByLocation(locationId);
      
      set(state => ({
        alarms,
        loadingStates: { ...state.loadingStates, fetchAlarms: false }
      }));
    } catch (error) {
      set(state => ({
        error: 'Error fetching location alarms',
        loadingStates: { ...state.loadingStates, fetchAlarms: false }
      }));
    }
  }
}));