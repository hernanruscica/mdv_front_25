import {useState} from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {Title1} from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import { useDataStore } from '../../store/dataStore';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';

const Channels = () => {
  const { businessUuid, dataloggerId } = useParams();
  const { user } = useAuthStore();  
  const [searchTerm, setSearchTerm] = useState('');
  const { datalogger, isLoadingDatalogger, errorDatalogger } = useFetchDatalogger(dataloggerId, businessUuid);  
  
  const hoursBackView = 120;  
 
  if (isLoadingDatalogger) {
    return <LoadingSpinner message='Cargando datos' />
  }

  if (errorDatalogger) {
    return <div>Error: {errorDatalogger }</div>
  }  

  //console.log(user.businesses_roles.find(br => br.uuid === businessUuid).role);
  const userCurrentRole = user.businesses_roles.find(br => br.uuid === businessUuid).role;
  

  return (
    <>
      <Title1 
        type="canales"
        text={`Canales del datalogger "${datalogger?.name || ''}""`}
      />
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
        showAddButton={user?.isOwner === 1 || userCurrentRole === 'Administrator'}
      />
      }
    </>
  );
};

export default Channels;
