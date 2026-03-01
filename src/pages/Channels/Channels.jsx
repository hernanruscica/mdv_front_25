import {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {Title1} from '../../components/Title1/Title1';
// import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import { useDataStore } from '../../store/dataStore';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';
import styles from './ViewChannel.module.css';

// NUEVOS IMPORTS
import { CHANNELS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

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

  const userCurrentRole = GetUserCurrentRole(user, businessUuid);

  // Determinamos la información para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? CHANNELS_LIST_INFO.Owner 
    : CHANNELS_LIST_INFO.General;

  
//console.log(userCurrentRole);

  return (
    <>
      <Title1 
        type="canales"
        text={`Canales del datalogger "${datalogger?.name || ''}""`}
      />

      <InfoAccordion data={infoData} />
{/*      
      <Breadcrumb 
        datalogger={datalogger?.name || 'datalogger generico'}
        ubicacion={datalogger?.business.name}
      />    */}
      <BreadcrumbAuto />

      { datalogger?.channels.length > 0 &&
        <ShowChannelsCards
        channels={datalogger?.channels}
        alarms={datalogger?.alarms}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
      />
      }
    </>
  );
};

export default Channels;
