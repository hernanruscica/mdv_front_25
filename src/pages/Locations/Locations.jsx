import { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';
import styles from '../Dashboard/Dashboard.module.css';

// NUEVOS IMPORTS
import { LOCATIONS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore(state => state.user);  
  const { 
    locations, 
    loadingStates: { fetchLocations: isLoadingLocations }, 
    error,
    fetchLocations 
  } = useLocationsStore();  

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchLocations(user);       
      }
    }
    fetchData();
  }, [user]);

  // ACTUALIZACIÓN: Lógica de rol y datos del acordeón
  const userCurrentRole = GetUserCurrentRole(user); // Sin UUID para check global de Owner
  
  const infoData = userCurrentRole?.name === 'Owner' 
    ? LOCATIONS_LIST_INFO.Owner 
    : LOCATIONS_LIST_INFO.General;

  if (isLoadingLocations ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>
      <Title1 
        type="ubicaciones"
        text="Ubicaciones" 
      />      
      
      {/* REEMPLAZO: Acordeón informativo */}
      <InfoAccordion data={infoData} />

      <Breadcrumb />
      
      <ShowLocationsCards
        user={user}
        locations={locations}                
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}        
        // ACTUALIZACIÓN: Usando el objeto de rol
        showAddButton={userCurrentRole?.name === 'Owner'}
      />
    </>
  );
};

export default Locations;