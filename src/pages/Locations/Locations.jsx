import React, { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore(state => state.user);
  
  const { 
    locations, 
    loadingStates: { fetchLocations: isLoading }, 
    error,
    fetchLocations 
  } = useLocationsStore();

  const {
    dataloggers,
    loadingStates: { fetchDataloggers: isLoadingDataloggers },
    fetchDataloggers
  } = useDataloggersStore();

  useEffect(() => {
    if (!dataloggers || dataloggers.length === 0) {
      fetchDataloggers(user);      
    }
    if (!locations || locations.length === 0) {
      fetchLocations(user);
    }
  }, [user]);

  if (isLoading || isLoadingDataloggers) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const activeLocations = filterEntitiesByStatus(locations);
  const activeDataloggers = filterEntitiesByStatus(dataloggers);

  return (
    <>
      <Breadcrumb />
      <Title1 
        type="ubicaciones"
        text="Ubicaciones" 
      />
      <ShowLocationsCards
        locations={activeLocations}
        dataloggers={activeDataloggers}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={user.espropietario === 1}
      />
    </>
  );
};

export default Locations;