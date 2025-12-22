import { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';
import styles from '../Dashboard/Dashboard.module.css';


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
        : '';

  return (
    <>
      
      <Title1 
        type="ubicaciones"
        text="Ubicaciones" 
      />      
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Como propietario, usted tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            Puede agregar nuevas ubicaciones y gestionar las existentes. Una ubicacion puede tener varios dataloggers.<br/><br/>
            Puede buscar una ubicacion, ver u ocultar las archivadas segun sea necesario.
          </p>          
        </>
        : <p className={styles.description}>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
      <Breadcrumb />
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