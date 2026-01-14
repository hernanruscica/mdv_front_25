import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {Title1} from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import { useDataStore } from '../../store/dataStore';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';
import styles from './ViewChannel.module.css';

const Channels = () => {
  const { businessUuid, dataloggerId } = useParams();
  const { user } = useAuthStore();  
  const [searchTerm, setSearchTerm] = useState('');
  const { 
    datalogger, 
    isLoadingDatalogger,   
    errorDatalogger,
    refreshDatalogger 
  } = useFetchDatalogger(dataloggerId, businessUuid); 

    const {
      dataloggerUsage,
      fetchDataloggerUsage,
      loadingStates: { fetchDataloggerUsage: isLoadingDataloggerUsage},
      error: errorLoadingDataloggerUsage
      } = useDataStore();

    useEffect(() => {
    const loadDataloggerUsage = async () => {       
      
      if (dataloggerId && businessUuid) {
        await fetchDataloggerUsage(businessUuid, dataloggerId);
      }
      refreshDatalogger();
    };
    
    loadDataloggerUsage();
  }, [dataloggerId, businessUuid]);  
 
  if (isLoadingDatalogger || isLoadingDataloggerUsage) {
    return <LoadingSpinner message='Cargando datos' />
  }

  if (errorLoadingDataloggerUsage || errorDatalogger) {
    return <div>Error cargando datos ... </div>
  }  

  //console.log(user.businesses_roles.find(br => br.uuid === businessUuid).role);
  //console.log('user', user);  

  const userCurrentRole = user?.businesses_roles.some(br => br.role === 'Owner')
         ? 'Owner'
         : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role

  
//console.log(userCurrentRole);

  return (
    <>
      <Title1 
        type="canales"
        text={`Canales del datalogger "${datalogger?.name || ''}""`}
      />
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Usted se encuentra en la pagina para ver todos los canales del datalogger seleccionado.<br/><br/>
            Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            En esta pagina puede: <strong> Agregar nuevos canales al datalogger</strong> actual. <br/><br/>
            Un datalogger puede tener varios canales, y cada canal puede terner varias alarmas asociadas.<br/><br/>
            Puede buscar un canal, ver u ocultar los archivados segun sea necesario.
          </p>          
        </>
        : <p className={styles.description}>
          Usted se encuentra en la pagina de detalles del datalogger seleccionado.<br/><br/>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
      <Breadcrumb 
        datalogger={datalogger?.name || 'datalogger generico'}
        ubicacion={datalogger?.business.name}
      />   

      { datalogger?.channels.length > 0 &&
        <ShowChannelsCards
        channels={datalogger?.channels}
        alarms={datalogger?.alarms}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />
      }
    </>
  );
};

export default Channels;
