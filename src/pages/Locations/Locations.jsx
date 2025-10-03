import { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
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

  useEffect(() => {
    const fetchData = async () => {
      if (user) {
        await fetchLocations(user);       
      }
    }
    fetchData();
    
  }, [user]);

  if (isLoadingLocations ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

  return (
    <>
      <Breadcrumb />
      <Title1 
        type="ubicaciones"
        text="Ubicaciones" 
      />
      <ShowLocationsCards
        user={user}
        locations={locations}                
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}        
        showAddButton={userCurrentRole === 'Owner'}
      />
    </>
  );
};

export default Locations;