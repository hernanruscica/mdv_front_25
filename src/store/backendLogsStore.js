import { create } from 'zustand';
import { backendLogsService } from '../services/backendLogsService';

export const useBackendLogsStore = create((set) => ({
  backendLogs: [],
  selectedLog: null,
  loadingStates: {
    fetchLogs: false,
    fetchLogById: false,
  },
  error: null,
  filters: {
    log_type: '',
    log_level: '',
    action: '',
    limit: 50,
  },

  fetchBackendLogs: async (filters = {}) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLogs: true },
      error: null,
    }));

    try {
      const params = Object.fromEntries(
        Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
      );
      const response = await backendLogsService.getAll(params);
      set(state => ({
        backendLogs: response?.items || [],
        loadingStates: { ...state.loadingStates, fetchLogs: false },
      }));
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener los historiales del servidor',
        loadingStates: { ...state.loadingStates, fetchLogs: false },
      }));
      return null;
    }
  },

  fetchBackendLogById: async (uuid) => {
    if (!uuid) return;

    set(state => ({
      loadingStates: { ...state.loadingStates, fetchLogById: true },
      error: null,
    }));

    try {
      const response = await backendLogsService.getById(uuid);
      set(state => ({
        selectedLog: response?.item || null,
        loadingStates: { ...state.loadingStates, fetchLogById: false },
      }));
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener el detalle del historial',
        loadingStates: { ...state.loadingStates, fetchLogById: false },
      }));
      return null;
    }
  },

  setFilters: (filters) => {
    set({ filters });
  },

  clearSelectedLog: () => {
    set({ selectedLog: null });
  },
}));
