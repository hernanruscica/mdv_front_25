import { useEffect } from 'react';
import { useDataloggersStore } from '../store/dataloggersStore';

export const useFetchDatalogger = (dataloggerId, businessUuid) => {
  const { 
    selectedDatalogger, 
    loadingStates, 
    error, 
    fetchDataloggerById 
  } = useDataloggersStore();
  
  // 1. Definimos la función de carga encapsulada
  // Esta función sirve tanto para el useEffect como para uso externo
  const fetchData = async () => {
    if (dataloggerId && businessUuid) {
      await fetchDataloggerById(dataloggerId, businessUuid);
    }
  };

  // 2. El useEffect para la carga inicial automática
  useEffect(() => {
    // Si no tenemos datalogger seleccionado o el ID cambió, cargamos.
    if (dataloggerId && businessUuid && (!selectedDatalogger || selectedDatalogger.uuid !== dataloggerId)) {
      fetchData();
    }
    // Nota: Agregué businessUuid a las dependencias para evitar warnings y bugs
  }, [dataloggerId, businessUuid, selectedDatalogger]); // fetchDataloggerById suele ser estable en Zustand

  return {
    datalogger: selectedDatalogger,
    isLoadingDatalogger: loadingStates.fetchDatalogger,
    isUpdattingDatalogger: loadingStates.updateDatalogger,
    isCreatingDatalogger: loadingStates.createDatalogger,
    errorDatalogger: error,
    
    // 3. Exponemos la función para que la uses donde quieras
    refreshDatalogger: fetchData
  };
};