import { useEffect } from 'react';

import { useAlarmLogsStore } from '../store/alarmLogsStore';

export const useAlarmLogs = (businessUuid, alarmId, options = { autoFetch: true }) => {
  // 1. Extraemos estado y acciones del Store
  const { 
    alarmLogs, 
    fetchAlarmLogsByAlarmId, 
    loadingStates, 
    error 
  } = useAlarmLogsStore();

  // 2. Efecto para la carga automática
  // Al poner la lógica aquí dentro, eliminamos la necesidad de useCallback externo.
  useEffect(() => {
    // Verificamos que existan los IDs y que autoFetch esté activo
    if (options.autoFetch && businessUuid && alarmId) {
      fetchAlarmLogsByAlarmId(businessUuid, alarmId);
    }
    // Las funciones de Zustand son estables, es seguro ponerlas en dependencias
  }, [businessUuid, alarmId, options.autoFetch, fetchAlarmLogsByAlarmId]);

  // 3. Función simple para refrescar manualmente
  // No necesita useCallback porque recrear esta función es trivial en términos de costo
  const handleRefresh = () => {
    if (businessUuid && alarmId) {
      fetchAlarmLogsByAlarmId(businessUuid, alarmId);
    }
  };

  // 4. Retorno estructurado (Clean Architecture: Interface Adapter)
  return {
    // Los datos puros
    alarmLogs,

    // El estado de la UI calculado
    status: {
      isLoading: loadingStates.fetchAlarmLogs,
      isError: !!error,
      errorMessage: error,
      isEmpty: !loadingStates.fetchAlarmLogs && alarmLogs?.length === 0
    },

    // Las acciones que la vista puede ejecutar
    actions: {
      refresh: handleRefresh
    }
  };
};