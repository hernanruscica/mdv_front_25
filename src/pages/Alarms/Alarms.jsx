import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {Title1} from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useChannelsStore } from '../../store/channelsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Table from '../../components/Table/Table';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';

const Alarms = () => {  
  const { businessUuid, userId, dataloggerId, channelId } = useParams();
  const navigate = useNavigate();
  const {user} = useAuthStore();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDatalogger, setCurrentDatalogger] = useState(null);
  const [currentAlarms, setCurrentAlarms] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const { loadingStates, fetchUserById } = useUsersStore();
  const { fetchAlarmsByUser, fetchAlarmsByLocation, alarms, isLoading: isLoadingAlarms, error : errorAlarms } = useAlarmsStore(); 

const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoadingDataloggers }, 
    error : errorDataloggers,
    fetchDataloggers    
  } = useDataloggersStore();  

  useEffect(() => {
    const loadDataByLocation = async () => {
      await fetchDataloggers(user, businessUuid);
      const currentLocationAlarms = await fetchAlarmsByLocation(businessUuid);
      setCurrentAlarms(currentLocationAlarms)
    }
    const loadDataByUser = async () => {
      await fetchDataloggers(user, businessUuid);
      const currentUserAlarms = await fetchAlarmsByUser(userId, businessUuid);          
      setCurrentAlarms(currentUserAlarms)
    }
    const loadDataByDatalogger = async () => {
      const dataloggersResponse = await fetchDataloggers(user, businessUuid);      
      const currentDataloggerResponse = dataloggersResponse.find(dl => dl.uuid === dataloggerId);
      setCurrentDatalogger(currentDataloggerResponse);
      setCurrentAlarms(currentDataloggerResponse?.alarms);
      if (channelId){
        setCurrentChannel(currentDataloggerResponse?.channels.find(ch => ch.uuid === channelId));
        setCurrentAlarms(currentDataloggerResponse?.alarms.filter(al => al.channel_uuid === channelId));
        //console.log(currentDataloggerResponse?.alarms.find(al => al.channel_uuid === channelId));
        
      }

    }
    //fetchAlarmsByUser

    if (businessUuid && !userId && !dataloggerId && !channelId){
      loadDataByLocation();
    }
    if (businessUuid && userId && !dataloggerId && !channelId) {                              
      loadDataByUser();
    }   
    if (businessUuid && dataloggerId && !userId && !channelId) {    
      console.log('business y datalogger');
      loadDataByDatalogger();
    }
    if (businessUuid && dataloggerId && channelId && !userId) {  
      console.log('business y datalogger y channel');
      loadDataByDatalogger();
    }
  }, [userId, businessUuid, dataloggerId, channelId])
  
  if (isLoadingAlarms || isLoadingDataloggers){
      return <LoadingSpinner message='Cargando datos...' />;
    }

 
  const columns = [
    { 
      label: 'NOMBRE ALARMA', 
      accessor: 'nombreAlarma',
      icon: '/icons/bell-regular.svg'
    },
    { 
      label: 'DATALOGGER', 
      accessor: 'datalogger',
      icon: '/icons/microchip-solid.svg'
    },    
    { 
      label: 'CONDICION', 
      accessor: 'condicion_mostrar',
      icon: '/icons/building-regular.svg'
    },   
    { 
      label: 'ESTADO', 
      accessor: 'estado',
      icon: '/icons/eye-regular.svg' 
    }
  ];

  
  const handleRowClick = (row) => {    
    navigate(row.url);
  };  
  

  const getTableData = () => {
    let baseUrl;
    //let currentAlarms = (businessUuid && dataloggerId && !userId && !channelId) ? currentDatalogger?.alarms : alarms;

    if (!currentAlarms?.length) return [];
    
    let filteredAlarms = currentAlarms;
    
    //console.log('filtradas', filteredAlarms);
    // Determinar la URL base según el contexto
    if (userId) {
      baseUrl = `/panel/usuarios/${userId}/alarmas`;
    } else if (dataloggerId && channelId) {
      baseUrl = `/panel/ubicaciones/${businessUuid}/dataloggers/${currentDatalogger?.uuid}/canales/${currentChannel?.uuid}/alarmas`;      
    } else if (businessUuid) {
      baseUrl = `/panel/ubicaciones/${businessUuid}/alarmas`;
    } else {
      baseUrl = `/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/alarmas`;      
    }

    return filteredAlarms.map(alarm => ({
      nombreAlarma: alarm.name,
      datalogger:  dataloggers.find(dl => dl.alarms.some(al => al.uuid === alarm.uuid))?.name || 'Sin nombre',             
      condicion_mostrar: `${alarm.condition_show} ` || 'Sin condición',
      estado: alarm.is_active,
      url: `${baseUrl}/${alarm.uuid}`      
    }));
  };
   
  const userCurrentRole = user.businesses_roles.find(br => br.uuid === businessUuid).role;
    
    
   
  //console.log(`userId: ${userId}`, locationId, dataloggerId, channelId);
//  console.log('current channel', currentChannel);
  //console.log('current datalogger alarms',currentDatalogger?.alarms);
  console.log(currentAlarms);
  

  return (
    <>
      <Title1 
        type="alarmas"
        text="Alarmas" 
      />
      <Breadcrumb 
        usuario={(currentAlarms?.length > 0) ? `${currentAlarms[0].username}` : ''} 
        datalogger={currentDatalogger?.name || ''}
        ubicacion={user?.businesses_roles.find(br=>br.uuid===businessUuid).name}
        canal={currentChannel?.name || ''}
      />
      {
        (user?.espropietario == 1 || user?.esadministrador == true) && (          
          <BtnCallToAction
            text="Agregar alarma"
            icon="plus-circle-solid.svg"
            type="normal"
            url={`/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/agregar`}
          />                           
        )
      }
       <Table 
        columns={columns}
        data={getTableData()}
        onRowClick={handleRowClick}
        showAddButton={ user?.isOwner == 1 || userCurrentRole === 'Administrator' }
      />{/* */}
    </>
  );
};

export default Alarms;