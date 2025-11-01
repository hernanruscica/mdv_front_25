import { useEffect } from 'react';
import { useDataloggersStore } from '../store/dataloggersStore';

export const useFetchDatalogger = (dataloggerId, businessUuid) => {
  const { selectedDatalogger, loadingStates, error, fetchDataloggerById, updateDatalogger } = useDataloggersStore();
  
  useEffect(() => {
    const loadDatalogger = async () => {
      await fetchDataloggerById(dataloggerId, businessUuid);
    };
//console.log('useeffect en useFetchdatalogger');

    if (dataloggerId && businessUuid && (!selectedDatalogger || selectedDatalogger.uuid !== dataloggerId)) {
      loadDatalogger();
    }
  }, [dataloggerId]);

  return {
    datalogger: selectedDatalogger,
    isLoadingDatalogger: loadingStates.fetchDatalogger,
    isUpdattingDatalogger: loadingStates.updateDatalogger,
    isCreatingDatalogger: loadingStates.createDatalogger,
    errorDatalogger: error,
  };
};
