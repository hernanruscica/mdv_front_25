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
  const [currentLocation, setCurrentLocation] = useState(null);
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
      await fetchAlarmsByLocation(businessUuid);
    }
    const loadDataByUser = async () => {
      await fetchDataloggers(user, businessUuid);
      await fetchAlarmsByUser(userId, businessUuid);          
    }

    if (businessUuid && !userId && !dataloggerId && !channelId){
      loadDataByLocation();
    }
    if (businessUuid && userId && !dataloggerId && !channelId) {                              
      loadDataByUser();
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
    } else if (businessUuid) {
      baseUrl = `/panel/ubicaciones/${businessUuid}/alarmas`;
    } else {
      baseUrl = `/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/alarmas`;
      // Filtrar alarmas solo por datalogger
      filteredAlarms = alarms.filter(alarm => 
        alarm.datalogger_id === parseInt(dataloggerId)
      );
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
  //console.log('dataloggers', dataloggers);

  return (
    <>
      <Title1 
        type="alarmas"
        text="Alarmas" 
      />
      <Breadcrumb 
        usuario={currentUser ? `${currentUser.first_name} ${currentUser.last_name}` : ''} 
        datalogger={currentDatalogger?.nombre || ''}
        ubicacion={user?.businesses_roles.find(br=>br.uuid===businessUuid).name}
        canal={currentChannel?.nombre || ''}
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