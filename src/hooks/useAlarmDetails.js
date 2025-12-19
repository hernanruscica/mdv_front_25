import { useEffect } from 'react';
import { useAlarmsStore } from '../store/alarmsStore';

export const useAlarmDetails = (businessUuid, alarmId) => {
  const { 
    fetchAlarmById,
    selectedAlarm,
    loadingStates,
    error: errorAlarms
  } = useAlarmsStore();

  // 1. Efecto único: Sincronizar la petición con los IDs
  useEffect(() => {
    if (businessUuid && alarmId) {
      // No necesitamos un try/catch local si el store ya maneja el error en 'errorAlarms'
      fetchAlarmById(businessUuid, alarmId);
    }
  }, [businessUuid, alarmId, fetchAlarmById]);

  // 2. Retornamos directamente lo que el Store nos da.
  // Nota: Eliminé currentChannel, logs, etc. porque actualmente NO se están cargando.
  // Si los necesitas, debes descomentar la lógica de sus respectivos stores.
  return {
    currentAlarm: selectedAlarm,
    isLoading: loadingStates.fetchAlarm || loadingStates.updateAlarm, // Usamos el loading del store
    error: errorAlarms // Usamos el error del store
  };
};