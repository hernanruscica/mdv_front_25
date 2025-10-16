import { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';
import styles from './Dataloggers.module.css';
import { data, useParams} from 'react-router-dom';

const Dataloggers = () => {
  const user = useAuthStore(state => state.user);
  const { businessUuid } = useParams();
  const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoading, updateDatalogger: isUpdatting, createDatalogger: isCreating }, 
    error,
    fetchDataloggers 
  } = useDataloggersStore();  

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {    
    fetchDataloggers(user, businessUuid);  
  }, [user, businessUuid]);

  if (isLoading ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

   const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;
  //console.log(dataloggers.find(dl => dl.business.uuid === businessUuid));

  return (
    <>
      <Title1 
        type="dataloggers"
        text="Dataloggers" 
      />
      <Breadcrumb ubicacion={dataloggers.find(dl => dl.business.uuid === businessUuid)?.business.name}/>
      
      <ShowDataloggersCards
        dataloggers={dataloggers.filter(dl=>dl.business.uuid === businessUuid)}              
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole == 'Administrator'}
        searchTerm = {searchTerm}
        onSearchChange = {setSearchTerm}
      />
      {/**/}
    </>
  );
};

export default Dataloggers;