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

const Alarms = () => {  
  const { userId, locationId, dataloggerId, channelId } = useParams();
  const {user} = useAuthStore();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentDatalogger, setCurrentDatalogger] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [currentChannel, setCurrentChannel] = useState(null);
  const { loadingStates, fetchUserById } = useUsersStore();
  const { fetchAlarmsByUser, fetchAlarmsByLocation, fetchAlarms, alarms, isLoading: isLoadingAlarms } = useAlarmsStore();
  
  const { 
    fetchDataloggerById,
    loadingStates: { fetchDatalogger: isLoadingDatalogger }
  } = useDataloggersStore();
  
  const { 
    fetchLocationById,
    selectedLocation,
    loadingStates: { fetchLocation: isLoadingLocation }
  } = useLocationsStore();
  
  const { 
    fetchChannelById,
    loadingStates: { fetchChannel: isLoadingChannel }
  } = useChannelsStore();

  const isLoadingUser = loadingStates?.fetchUserById;
  const isLoading = isLoadingUser || isLoadingAlarms || isLoadingDatalogger || isLoadingLocation || isLoadingChannel;
  const navigate = useNavigate();

  const columns = [
    { 
      label: 'NOMBRE ALARMA', 
      accessor: 'nombreAlarma',
      icon: '/icons/bell-regular.svg'
    },
    { 
      label: 'CANAL', 
      accessor: 'canal',
      icon: '/icons/code-branch-solid.svg'
    },
    { 
      label: 'TIPO', 
      accessor: 'tipo',
      icon: '/icons/flag-regular.svg'
    },
    { 
      label: 'CONDICION', 
      accessor: 'condicion',
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
  
  useEffect(() => {
    const fetchInitialData = async () => {      
      try {
        
        if (userId) {                    
          const userResult = await fetchUserById(userId);          
          if (userResult) {
            setCurrentUser(userResult);            
          }
          await fetchAlarmsByUser(userId);          
        }    
        
        if (locationId) {
          //console.log(`Fetching alarms for location Id: ${locationId}`);
          const locationResult = await fetchLocationById(locationId);
          //console.log('Location result:', locationResult);
          if (locationResult) {
            setCurrentLocation(locationResult);
            await fetchAlarmsByLocation(locationId);
          }
        }
        
        if (dataloggerId) {
          const dataloggerResult = await fetchDataloggerById(dataloggerId);
          if (dataloggerResult) {
            setCurrentDatalogger(dataloggerResult);
            if (!alarms?.length) {
              await fetchAlarms(user);
            }
          }

          if (channelId) {
            const channelResult = await fetchChannelById(channelId);
            if (channelResult) {
              setCurrentChannel(channelResult);
            }
          }
        }

        
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchInitialData();
  }, [userId, dataloggerId, locationId, channelId, user, fetchUserById, fetchAlarmsByUser, fetchAlarms]);

  const getTableData = () => {
    if (!alarms?.length) return [];

    let baseUrl;
    let filteredAlarms = alarms;

    // Determinar la URL base según el contexto
    if (userId) {
      baseUrl = `/panel/usuarios/${userId}/alarmas`;
    } else if (dataloggerId && channelId) {
      baseUrl = `/panel/dataloggers/${currentDatalogger?.id}/canales/${currentChannel?.id}/alarmas`;
      // Filtrar alarmas por datalogger y canal
      filteredAlarms = alarms.filter(alarm => 
        alarm.datalogger_id === parseInt(dataloggerId) && 
        alarm.canal_id === parseInt(channelId)
      );
    } else if (locationId) {
      baseUrl = `/panel/ubicaciones/${locationId}/alarmas`;
    } else {
      baseUrl = `/panel/dataloggers/${dataloggerId}/alarmas`;
      // Filtrar alarmas solo por datalogger
      filteredAlarms = alarms.filter(alarm => 
        alarm.datalogger_id === parseInt(dataloggerId)
      );
    }

    return filteredAlarms.map(alarm => ({
      nombreAlarma: alarm.nombre,
      canal: alarm?.canal_nombre || 'Sin canal',
      tipo: alarm.tipo_alarma,         
      condicion: alarm.condicion,
      estado: alarm.estado,
      url: `${baseUrl}/${alarm.id}`      
    }));
  };

  if (isLoading) {
    let loadingMessage = 'Cargando datos';
    if (isLoadingUser) loadingMessage = 'Cargando información del usuario...';
    if (isLoadingDatalogger) loadingMessage = 'Cargando información del datalogger...';
    if (isLoadingLocation) loadingMessage = 'Cargando información de la ubicación...';
    if (isLoadingChannel) loadingMessage = 'Cargando información del canal...';
    if (isLoadingAlarms) loadingMessage = 'Cargando alarmas...';
    
    return <LoadingSpinner message={loadingMessage} />;
  }   
  //console.log(`userId: ${userId}`, locationId, dataloggerId, channelId);
  console.log( alarms);

  return (
    <>
      <Title1 
        type="alarmas"
        text="Alarmas" 
      />
      <Breadcrumb 
        usuario={currentUser ? `${currentUser.nombre_1} ${currentUser.apellido_1}` : ''} 
        datalogger={currentDatalogger?.nombre || ''}
        ubicacion={selectedLocation?.nombre || ''}
        canal={currentChannel?.nombre || ''}
      />
      <Table 
        columns={columns}
        data={getTableData()}
        onRowClick={handleRowClick}
      />
    </>
  );
};

export default Alarms;