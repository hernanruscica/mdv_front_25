import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import {Title1} from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useUsersStore } from '../../store/usersStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Table from '../../components/Table/Table';

const Alarms = () => {  
  const { userId, locationId, dataloggerId, channelId } = useParams();
  const [currentUser, setCurrentUser] = useState(null);
  const [preparedData, setPreparedData] = useState([]);
  const { loadingStates, fetchUserById } = useUsersStore();
  const { fetchAlarmsByUser, alarms, isLoading : isLoadingAlarms, error : errorAlarms } = useAlarmsStore();
  const isLoadingUser = loadingStates?.fetchUserById;  

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
    //https://mdv-monitoreo-remoto-frontend.onrender.com/panel/dataloggers/3/canales/13/alarmas/57
    navigate(`/panel/dataloggers/${row.id}`);
  };  

  useEffect(() => {
    const fetchData = async () => {
      const currentUser = await fetchUserById(userId);
      if (currentUser) {
        setCurrentUser(currentUser);        
        await fetchAlarmsByUser(currentUser);                
      }
    }
    if (userId) {
      fetchData();
    }
  }, [userId]);

  useEffect(() => {
    if (alarms && alarms.length > 0) {
      setPreparedData(
        alarms.map(alarm => ({
          nombreAlarma: alarm.nombre,
          canal: alarm.canal_nombre,          
          condicion: alarm.condicion,
          id: alarm.id
      })));
    }
  }, [alarms])

  if (isLoadingUser || isLoadingAlarms) {
    return <LoadingSpinner message='Cargando datos'/>
  }

  console.log(alarms)

  return (
    <>
      <Title1 
        type="alarmas"
        text="Alarmas" 
      />
      <Breadcrumb 
        usuario={(currentUser) ? `${currentUser?.nombre_1} ${currentUser?.apellido_1}` : ''} 
      />
      <p>En la siguiente tabla, se pueden ver las alarmas vigentes para {`${currentUser?.nombre_1} ${currentUser?.apellido_1}`}. </p>
      <Table 
        columns={columns}
        data={preparedData}
        onRowClick={handleRowClick}
      />
    </>
  );
};

export default Alarms;