import { create } from 'zustand';
import { maintenanceLogsService } from '../services/maintenanceLogsService';

export const useMaintenanceLogsStore = create((set) => ({
  maintenanceLogs: [],
  selectedMaintenanceLog: null,
  loadingStates: {
    fetchMaintenanceLogs: false,
    fetchMaintenanceLogById: false,
    createMaintenanceLog: false,
    updateMaintenanceLog: false,
    completeMaintenanceLog: false,
    softDeleteMaintenanceLog: false,
    hardDeleteMaintenanceLog: false
  },
  error: null,

  fetchMaintenanceLogs: async (businessUuid, dataloggerUuid, channelUuid = null) => {
    console.log("businessUuid, dataloggerUuid, channelUuid --- STORE", businessUuid, dataloggerUuid, channelUuid)
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchMaintenanceLogs: true },
      error: null
    }));

    try {
      const response = channelUuid
        ? await maintenanceLogsService.getAllByChannel(businessUuid, dataloggerUuid, channelUuid)
        : await maintenanceLogsService.getAllByDatalogger(businessUuid, dataloggerUuid);
      
      set(state => ({
        maintenanceLogs: response?.items || [],
        loadingStates: { ...state.loadingStates, fetchMaintenanceLogs: false }
      }));
      
      return response?.items || [];
    } catch (error) {
      set(state => ({
        error: 'Error al obtener los logs de mantenimiento',
        loadingStates: { ...state.loadingStates, fetchMaintenanceLogs: false }
      }));
      return [];
    }
  },

  fetchMaintenanceLogById: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, fetchMaintenanceLogById: true },
      error: null
    }));

    try {
      const response = await maintenanceLogsService.getById(
        businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid
      );
      
      set(state => ({
        selectedMaintenanceLog: response?.item || null,
        loadingStates: { ...state.loadingStates, fetchMaintenanceLogById: false }
      }));
      
      return response?.item || null;
    } catch (error) {
      set(state => ({
        error: 'Error al obtener el log de mantenimiento',
        loadingStates: { ...state.loadingStates, fetchMaintenanceLogById: false }
      }));
      return null;
    }
  },

  createMaintenanceLog: async (businessUuid, dataloggerUuid, logData, channelUuid = null) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, createMaintenanceLog: true },
      error: null
    }));

    try {
      const response = await maintenanceLogsService.create(
        businessUuid, dataloggerUuid, logData, channelUuid
      );
      
      if (response?.success) {
        set(state => ({
          maintenanceLogs: [...state.maintenanceLogs, response.item],
          loadingStates: { ...state.loadingStates, createMaintenanceLog: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, createMaintenanceLog: false }
        }));
      }
      
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al crear el log de mantenimiento',
        loadingStates: { ...state.loadingStates, createMaintenanceLog: false }
      }));
      throw error;
    }
  },

  updateMaintenanceLog: async (businessUuid, dataloggerUuid, maintenanceLogUuid, logData, channelUuid = null) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, updateMaintenanceLog: true },
      error: null
    }));

    try {
      const response = await maintenanceLogsService.update(
        businessUuid, dataloggerUuid, maintenanceLogUuid, logData, channelUuid
      );
      
      if (response?.success) {
        set(state => ({
          maintenanceLogs: state.maintenanceLogs.map(log => 
            log.uuid === maintenanceLogUuid ? response.item : log
          ),
          selectedMaintenanceLog: response.item,
          loadingStates: { ...state.loadingStates, updateMaintenanceLog: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, updateMaintenanceLog: false }
        }));
      }
      
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al actualizar el log de mantenimiento',
        loadingStates: { ...state.loadingStates, updateMaintenanceLog: false }
      }));
      throw error;
    }
  },

  completeMaintenanceLog: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, completeMaintenanceLog: true },
      error: null
    }));

    try {
      const response = await maintenanceLogsService.complete(
        businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid
      );
      
      if (response?.success) {
        set(state => ({
          maintenanceLogs: state.maintenanceLogs.map(log => 
            log.uuid === maintenanceLogUuid ? response.item : log
          ),
          selectedMaintenanceLog: response.item,
          loadingStates: { ...state.loadingStates, completeMaintenanceLog: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, completeMaintenanceLog: false }
        }));
      }
      
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al completar el log de mantenimiento',
        loadingStates: { ...state.loadingStates, completeMaintenanceLog: false }
      }));
      throw error;
    }
  },

  softDeleteMaintenanceLog: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, softDeleteMaintenanceLog: true },
      error: null
    }));

    try {
      const response = await maintenanceLogsService.softDelete(
        businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid
      );
      
      if (response?.success) {
        set(state => ({
          maintenanceLogs: state.maintenanceLogs.filter(log => log.uuid !== maintenanceLogUuid),
          selectedMaintenanceLog: state.selectedMaintenanceLog?.uuid === maintenanceLogUuid 
            ? null 
            : state.selectedMaintenanceLog,
          loadingStates: { ...state.loadingStates, softDeleteMaintenanceLog: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, softDeleteMaintenanceLog: false }
        }));
      }
      
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al eliminar el log de mantenimiento',
        loadingStates: { ...state.loadingStates, softDeleteMaintenanceLog: false }
      }));
      throw error;
    }
  },

  hardDeleteMaintenanceLog: async (businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid = null) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, hardDeleteMaintenanceLog: true },
      error: null
    }));

    try {
      const response = await maintenanceLogsService.hardDelete(
        businessUuid, dataloggerUuid, maintenanceLogUuid, channelUuid
      );
      
      if (response?.success) {
        set(state => ({
          maintenanceLogs: state.maintenanceLogs.filter(log => log.uuid !== maintenanceLogUuid),
          selectedMaintenanceLog: state.selectedMaintenanceLog?.uuid === maintenanceLogUuid 
            ? null 
            : state.selectedMaintenanceLog,
          loadingStates: { ...state.loadingStates, hardDeleteMaintenanceLog: false }
        }));
      } else {
        set(state => ({
          loadingStates: { ...state.loadingStates, hardDeleteMaintenanceLog: false }
        }));
      }
      
      return response;
    } catch (error) {
      set(state => ({
        error: 'Error al eliminar permanentemente el log de mantenimiento',
        loadingStates: { ...state.loadingStates, hardDeleteMaintenanceLog: false }
      }));
      throw error;
    }
  },

  clearSelectedMaintenanceLog: () => {
    set({ selectedMaintenanceLog: null });
  },

  clearError: () => {
    set({ error: null });
  }
}));
