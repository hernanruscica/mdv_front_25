import { useEffect } from 'react';
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
    loadingStates: { fetchDataloggers: isLoading }, 
    error,
    fetchDataloggers 
  } = useDataloggersStore();  

  useEffect(() => {
    if (!dataloggers || dataloggers.length === 0) {
      fetchDataloggers(user, businessUuid);
    }
    
  }, [user]);

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
  //console.log(dataloggers[0].business.name);

  return (
    <>
      <Title1 
        type="dataloggers"
        text="Dataloggers" 
      />
      <Breadcrumb ubicacion={dataloggers[0]?.business.name}/>
      
      <ShowDataloggersCards
        dataloggers={dataloggers}              
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole == 'Administrator'}
      />
      {/**/}
    </>
  );
};

export default Dataloggers;