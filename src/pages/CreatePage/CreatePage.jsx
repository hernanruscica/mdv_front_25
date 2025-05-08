import React, {useState, useEffect} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb.jsx";
import { Title1 } from "../../components/Title1/Title1.jsx";
import { useChannelsStore } from '../../store/channelsStore.js';
import { useDataloggersStore } from '../../store/dataloggersStore.js';
import { useLocationsStore } from '../../store/locationsStore.js';
import { useAlarmsStore } from '../../store/alarmsStore.js';
import { useUsersStore } from '../../store/usersStore.js';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner.jsx';
import { UserCreateForm, LocationCreateForm, DataloggerCreateForm, ChannelCreateForm, AlarmCreateForm, DefaultForm } from '../../components/Forms/Index.jsx';

const nameEntity = (path) => {  
  const action = path[path.length - 1];
  let entityName = 'default';
  if (action === 'agregar') entityName = path[path.length - 2];
  if (action === 'editar') entityName = path[path.length - 3];  
  return entityName;
}

 const formComponents = {
    usuarios: UserCreateForm,    
    ubicaciones: LocationCreateForm,  
    dataloggers: DataloggerCreateForm,
    canales: ChannelCreateForm,
    alarmas: AlarmCreateForm,
    default: DefaultForm,
  };
  

const CreatePage = () => {
  
  const { userId, locationId, dataloggerId, channelId, alarmId } = useParams();
  const location = useLocation();  
  const fullPath = location.pathname.split('/').filter(path => path !== '');   
  const [currentEntityName, setCurrentEntityName] = useState(nameEntity(fullPath));
  const [currentAction, setCurrentAction] = useState(fullPath[fullPath.length - 1]);  

  const { 
    fetchChannelById, 
    selectedChannel,
    loadingStates: { fetchChannel: loadingChannel }
  } = useChannelsStore();

  const {
    fetchDataloggerById,
    selectedDatalogger,
    loadingStates: { fetchDatalogger: loadingDatalogger }
  } = useDataloggersStore();

  const {
    fetchLocationById,
    selectedLocation,
    loadingStates: { fetchLocation: loadingLocation }
  } = useLocationsStore();

  const {
    fetchAlarmById,
    selectedAlarm,
    loadingStates: { fetchAlarm: loadingAlarm }
  } = useAlarmsStore();

  const {
    fetchUserById,
    selectedUser,
    isLoading: loadingUser
  } = useUsersStore();

  useEffect(() => {
    if (channelId) {
      fetchChannelById(channelId);
    }
  }, [channelId]);

  useEffect(() => {
    if (dataloggerId) {
      fetchDataloggerById(dataloggerId);
    }
  }, [dataloggerId]);

  useEffect(() => {
    if (locationId && currentAction == 'editar') {      
      fetchLocationById(locationId);
    }
  }, [locationId]);
  
  useEffect(() => {
    if (alarmId && currentAction === 'editar') {
      fetchAlarmById(alarmId);
    }
  }, [alarmId, currentAction, fetchAlarmById]);

  useEffect(() => {
    if (userId && currentAction == 'editar') {
      fetchUserById(userId); 
    }
  }, [userId]);

  if (loadingChannel || loadingDatalogger || loadingLocation || loadingAlarm || loadingUser) {
    return <LoadingSpinner message='Cargando datos...' />
  }

  const FormComponent = formComponents[currentEntityName] || formComponents.default;

  console.log(selectedUser);

  return (
    <>
      <Title1
        type="edicion"
        text={`Página de ${currentAction === 'editar' ? 'edición' : 'creación'} de ${currentEntityName}`}
      />
      <Breadcrumb 
        usuario={ selectedUser ? `${selectedUser?.nombre_1} ${selectedUser?.apellido_1}` : ''}
        datalogger={selectedDatalogger?.nombre || ''}
        canal={selectedChannel?.nombre || ''}
        alarma={selectedAlarm?.nombre || ''}
      />

      <FormComponent 
        userId={userId}        
        userData={selectedUser}
        dataloggerId={dataloggerId}
        dataloggerData={selectedDatalogger}
        channelId={channelId}
        channelData={selectedChannel}
        locationData={selectedLocation}
        alarmData={selectedAlarm}
        isEditing={currentAction === 'editar'}
      />
    </>
  );
};

export default CreatePage;