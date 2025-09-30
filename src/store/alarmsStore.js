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
  fetchAlarmsByUser: async (userUuid, businessUuid) => {
    console.log("desde el store alarm, userUuid:", userUuid);
    console.log('businessUuid', businessUuid);
    
    if (!userUuid) return;
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarmsByUser: true },
      error: null
    }));

    try {
      const alarms =  await alarmsService.getAllByUser(userUuid, businessUuid);
        
      set(state => ({
        alarms,
        loadingStates: { ...state.loadingStates, fetchAlarmsByUser: false }
      }));
      return alarms;
    } catch (error) {
      set(state => ({
        error: 'Error fetching alarms by User',
        loadingStates: { ...state.loadingStates, fetchAlarmsByUser: false }
      }));
    }
  },
  
  fetchAlarmsByLocation: async (locationId) => {
    if (!locationId) return [];
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarms: true },
      error: null
    }));

    try {
      const alarms = await alarmsService.getAllByLocation(locationId);
      set(state => ({
        alarms: Array.isArray(alarms) ? alarms : [],
        loadingStates: { ...state.loadingStates, fetchAlarms: false }
      }));
      return Array.isArray(alarms) ? alarms : [];
    } catch (error) {
      set(state => ({
        error: 'Error fetching location alarms',
        loadingStates: { ...state.loadingStates, fetchAlarms: false },
        alarms: []
      }));
      return [];
    }
  },
  
  fetchAlarmById: async (alarmId) => {
    if (!alarmId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarm: true },
      error: null
    }));

    try {
      const alarm = await alarmsService.getById(alarmId);
      
      set(state => ({
        selectedAlarm: alarm,
        loadingStates: { ...state.loadingStates, fetchAlarm: false }
      }));
      
      return alarm;
    } catch (error) {
      set(state => ({
        error: 'Error fetching alarm details',
        loadingStates: { ...state.loadingStates, fetchAlarm: false }
      }));
      return null;
    }
  },
  
  createAlarm: async (alarmData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createAlarm: true },
      error: null
    }));

    try {
      const response = await alarmsService.create(alarmData);
      if (response.success) {
        set(state => ({
          alarms: [...state.alarms, response.alarm],
          loadingStates: { ...state.loadingStates, createAlarm: false }
        }));
        return response;
      }
    } catch (error) {
      set(state => ({
        error: 'Error al crear la alarma',
        loadingStates: { ...state.loadingStates, createAlarm: false }
      }));
      throw error;
    }
  },
  
  updateAlarm: async (alarmId, alarmData) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, updateAlarm: true },
      error: null
    }));

    try {
      const response = await alarmsService.update(alarmId, alarmData);
      if (response.success) {
        set(state => ({
          alarms: state.alarms.map(alarm => 
            alarm.id === alarmId ? response.alarm : alarm
          ),
          selectedAlarm: response.alarm,
          loadingStates: { ...state.loadingStates, updateAlarm: false }
        }));
        return response;
      }
    } catch (error) {
      set(state => ({
        error: 'Error al actualizar la alarma',
        loadingStates: { ...state.loadingStates, updateAlarm: false }
      }));
      throw error;
    }
  },
  
  fetchAlarmsByChannel: async (channelId) => {
    if (!channelId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarmsByChannel: true },
      error: null
    }));

    try {
      const alarms = await alarmsService.getAllByChannel(channelId);
      //console.log('Alarms by channel:', alarms);
      set(state => ({
        alarms,
        loadingStates: { ...state.loadingStates, fetchAlarmsByChannel: false }
      }));
      return alarms;
    } catch (error) {
      set(state => ({
        error: 'Error fetching channel alarms',
        loadingStates: { ...state.loadingStates, fetchAlarmsByChannel: false }
      }));
    }
  },
}));