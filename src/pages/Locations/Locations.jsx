import React, { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore(state => state.user);
  
  const { 
    locations, 
    loadingStates: { fetchLocations: isLoadingLocations }, 
    error,
    fetchLocations 
  } = useLocationsStore();

  const {
    dataloggers,
    loadingStates: { fetchDataloggers: isLoadingDataloggers },
    fetchDataloggers
  } = useDataloggersStore();

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchLocations(user);
        await fetchDataloggers(user);
      }
    }
    fetchData();
    
  }, [user]);

  if (isLoadingLocations || isLoadingDataloggers) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <Breadcrumb />
      <Title1 
        type="ubicaciones"
        text="Ubicaciones" 
      />
      <ShowLocationsCards
        locations={locations}
        dataloggers={dataloggers}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={user.espropietario === 1}
      />
    </>
  );
};

export default Locations;