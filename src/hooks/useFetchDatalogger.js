import { useEffect } from 'react';
import { useDataloggersStore } from '../store/dataloggersStore';

export const useFetchDatalogger = (dataloggerId, businessUuid) => {
  const { selectedDatalogger, loadingStates, error, fetchDataloggerById } = useDataloggersStore();

  useEffect(() => {
    if (dataloggerId && businessUuid) {
      fetchDataloggerById(dataloggerId, businessUuid);
    }
  }, [dataloggerId, businessUuid, fetchDataloggerById]);

  return {
    datalogger: selectedDatalogger,
    isLoadingDatalogger: loadingStates.fetchDatalogger,
    errorDatalogger: error,
  };
};
