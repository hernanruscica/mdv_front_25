import React, {useState, useEffect, useMemo} from 'react';
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
  const { fetchDataloggerById } = useDataloggersStore();
  const { fetchLocationById } = useLocationsStore();
  const { fetchChannelById } = useChannelsStore();
  const isLoadingUser = loadingStates?.fetchUserById;  
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
      label: 'CONDICION', 
      accessor: 'condicion',
      icon: '/icons/building-regular.svg'
    }
  ];

  const handleRowClick = (row) => {    
    navigate(row.url);
  };  

  // Efecto para cargar datos iniciales
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        if (userId) {
          const userResult = await fetchUserById(userId);
          if (userResult) {
            setCurrentUser(userResult);
            await fetchAlarmsByUser(userResult);
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

        if (locationId) {
          const locationResult = await fetchLocationById(locationId);
          if (locationResult) {
            setCurrentLocation(locationResult);
            await fetchAlarmsByLocation(locationId);
          }
        }
      } catch (error) {
        console.error('Error al cargar datos:', error);
      }
    };

    fetchInitialData();
  }, [userId, dataloggerId, locationId, channelId, user, fetchUserById, fetchDataloggerById, fetchLocationById, fetchChannelById, fetchAlarmsByUser, fetchAlarms, fetchAlarmsByLocation]);

  const preparedData = useMemo(() => {
    if (!alarms?.length) return [];

    let baseUrl;
    if (userId) {
      baseUrl = `/panel/usuarios/${currentUser?.id}/alarmas`;
    } else if (dataloggerId && channelId) {
      baseUrl = `/panel/dataloggers/${currentDatalogger?.id}/canales/${currentChannel?.id}/alarmas`;
    } else if (locationId) {
      baseUrl = `/panel/ubicaciones/${currentLocation?.id}/alarmas`;
    } else if (channelId) {
      baseUrl = `/panel/dataloggers/${currentDatalogger?.id}/alarmas`;      
    }

    let filteredAlarms = alarms;
    
    if (dataloggerId) {
      filteredAlarms = alarms.filter(alarm => alarm.datalogger_id === currentDatalogger?.id);
      
      if (channelId && currentChannel) {        
        filteredAlarms = filteredAlarms.filter(alarm => alarm.canal_id === currentChannel.id);
      }
    }

    return filteredAlarms.map(alarm => ({
      nombreAlarma: alarm.nombre,
      canal: alarm.canal_nombre,
      condicion: alarm.condicion,
      url: `${baseUrl}/${alarm.id}`
    }));
  }, [alarms, userId, dataloggerId, locationId, channelId, currentUser, currentDatalogger, currentLocation, currentChannel]);

  if (isLoadingUser || isLoadingAlarms) {
    return <LoadingSpinner message='Cargando datos'/>;
  }   
  //console.log(alarms, currentChannel)

  return (
    <>
      <Title1 
        type="alarmas"
        text="Alarmas" 
      />
      <Breadcrumb 
        usuario={currentUser ? `${currentUser.nombre_1} ${currentUser.apellido_1}` : ''} 
        datalogger={currentDatalogger?.nombre || ''}
        ubicacion={currentLocation?.nombre || ''}
        canal={currentChannel?.nombre || ''}
      />
      <Table 
        columns={columns}
        data={preparedData}
        onRowClick={handleRowClick}
      />
    </>
  );
};

export default Alarms;