import { useEffect } from 'react';
import { useDataloggersStore } from '../store/dataloggersStore';

export const useFetchDatalogger = (dataloggerId, businessUuid) => {
  const { 
    selectedDatalogger, 
    loadingStates, 
    error, 
    fetchDataloggerById 
  } = useDataloggersStore();
  
  const fetchData = async () => {
    if (dataloggerId && businessUuid) {
      await fetchDataloggerById(dataloggerId, businessUuid);
    }
  };

  useEffect(() => {
    if (dataloggerId && businessUuid) {
      fetchData();
    }
  }, [dataloggerId, businessUuid]);

  return {
    datalogger: selectedDatalogger,
    isLoadingDatalogger: loadingStates.fetchDatalogger,
    isUpdattingDatalogger: loadingStates.updateDatalogger,
    isCreatingDatalogger: loadingStates.createDatalogger,
    errorDatalogger: error,
    refreshDatalogger: fetchData
  };
};