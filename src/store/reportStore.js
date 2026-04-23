import { create } from 'zustand';
import { reportService } from '../services/reportService';

export const useReportStore = create((set) => ({
  channelData: null,
  maintenanceLogs: [],
  alarmLogs: [],
  dateRange: { start: null, end: null },
  selectedSections: {
    totalUsageHours: true,
    chart: true,
    maintenance: true,
    alarmTriggers: true,
    energyFailures: true
  },
  loadingStates: {
    generateReport: false,
    exportPdf: false
  },
  error: null,

  generateReport: async (businessUuid, channelUuid, dataloggerUuid, start, end) => {
    set(state => ({
      loadingStates: { ...state.loadingStates, generateReport: true },
      error: null,
      dateRange: { start, end }
    }));

    try {
      const reportData = await reportService.getReportData(
        businessUuid, channelUuid, dataloggerUuid, start, end
      );

      set(state => ({
        channelData: reportData.channelData,
        maintenanceLogs: reportData.maintenanceLogs,
        alarmLogs: reportData.alarmLogs,
        loadingStates: { ...state.loadingStates, generateReport: false }
      }));

      return reportData;
    } catch (error) {
      console.error('Error generating report:', error);
      set(state => ({
        error: 'Error al generar el informe',
        loadingStates: { ...state.loadingStates, generateReport: false }
      }));
      return null;
    }
  },

  setDateRange: (start, end) => {
    set({ dateRange: { start, end } });
  },

  toggleSection: (sectionKey) => {
    set(state => ({
      selectedSections: {
        ...state.selectedSections,
        [sectionKey]: !state.selectedSections[sectionKey]
      }
    }));
  },

  clearReport: () => {
    set({
      channelData: null,
      maintenanceLogs: [],
      alarmLogs: [],
      dateRange: { start: null, end: null },
      error: null
    });
  },

  clearError: () => {
    set({ error: null });
  }
}));
