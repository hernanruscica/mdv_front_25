import { create } from 'zustand';
import { alarmLogsService } from '../services/alarmLogsService';

export const useAlarmLogsStore = create((set) => ({
  alarmLogs: [],
  alarmLogsDatalogger: [],
  loadingStates: {
    fetchAlarmLogs: false,
    fetchAlarmLogsByDataloggerId: false
  },
  error: null,

  fetchAlarmLogsByAlarmId: async (businessUuid, alarmId) => {
    if (!alarmId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarmLogs: true },
      error: null
    }));

    try {
      const logs = await alarmLogsService.getByAlarmId(businessUuid, alarmId);
      
      set(state => ({
        alarmLogs: logs,
        loadingStates: { ...state.loadingStates, fetchAlarmLogs: false }
      }));
      
      return logs;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener los registros de la alarma',
        loadingStates: { ...state.loadingStates, fetchAlarmLogs: false }
      }));
      return null;
    }
  },
  fetchAlarmLogsByDataloggerId: async (businessUuid, dataloggerId) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarmLogsByDataloggerId: true },
      error: null
    }));

    try {     
      const dataloggerAlarmLogs = await alarmLogsService.getByDataloggerId(businessUuid, dataloggerId);

      set(state => ({
        alarmLogsDatalogger: dataloggerAlarmLogs,
        loadingStates: { ...state.loadingStates, fetchAlarmLogsByDataloggerId: false }
      }));

      return dataloggerAlarmLogs;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener todos los registros de alarmas',
        loadingStates: { ...state.loadingStates, fetchAlarmLogsByDataloggerId: false }
      }));
      return null;
    }
  }
}));