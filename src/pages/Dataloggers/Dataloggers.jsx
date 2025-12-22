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
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Usted se encuentra en la pagina para ver todos los datalogger de una ubicacion.<br/><br/>
            Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            En esta pagina puede: <strong> Agregar nuevos datalogger</strong> a la ubicacion actual. <br/><br/>
            Una ubicacion puede tener varios dataloggers, y cada datalogger puede tener varios canales y alarmas asociados.<br/><br/>
            Puede buscar un datalogger, ver u ocultar los archivados segun sea necesario.
          </p>          
        </>
        : <p className={styles.description}>
          Usted se encuentra en la pagina de detalles del datalogger seleccionado.<br/><br/>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
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