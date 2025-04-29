import { create } from 'zustand';
import { alarmLogsService } from '../services/alarmLogsService';

export const useAlarmLogsStore = create((set) => ({
  alarmLogs: [],
  loadingStates: {
    fetchAlarmLogs: false
  },
  error: null,

  fetchAlarmLogsByAlarmId: async (alarmId) => {
    if (!alarmId) return;
    
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchAlarmLogs: true },
      error: null
    }));

    try {
      const logs = await alarmLogsService.getByAlarmId(alarmId);
      
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
  }
}));