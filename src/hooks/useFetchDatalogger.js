import { useEffect } from 'react';
import { useDataloggersStore } from '../store/dataloggersStore';

export const useFetchDatalogger = (dataloggerId, businessUuid) => {
  const { selectedDatalogger, loadingStates, error, fetchDataloggerById, updateDatalogger } = useDataloggersStore();

  useEffect(() => {
    if (dataloggerId && businessUuid) {
      fetchDataloggerById(dataloggerId, businessUuid);
    }
  }, [dataloggerId, businessUuid, fetchDataloggerById, loadingStates.updateDatalogger, loadingStates.createDatalogger]);

  return {
    datalogger: selectedDatalogger,
    isLoadingDatalogger: loadingStates.fetchDatalogger,
    isUpdattingDatalogger: loadingStates.updateDatalogger,
    isCreatingDatalogger: loadingStates.createDatalogger,
    errorDatalogger: error,
  };
};
