import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms'; // Quizás renombrar a AlarmsListTable
import { useAlarmsStrategy } from '../../hooks/useAlarmsStrategy'; // Importamos el hook nuevo
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useUsersStore } from '../../store/usersStore';
import styles from './ViewAlarm.module.css';

const ViewAlarms = () => {
  const params = useParams(); // businessUuid, alarmId, userId, dataloggerId, channelId
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  // Stores para datos extra de breadcrumbs (opcional si ya los tienes en caché)
  const { selectedDatalogger, 
          fetchDataloggerById, 
          loadingStates: { fetchDatalogger: isLoadingDatalogger } 
        } = useDataloggersStore();
  
   const { 
      selectedLocation,
      fetchLocationById,
      loadingStates: { fetchLocation: isLoadingLocation}
    } = useLocationsStore();

  const {
    selectedUser,
    fetchUserById,
    loadingStates: { fetchUser: isLoadingUser }
  } = useUsersStore();
  

  // USAMOS EL HOOK NUEVO
  const { alarms, title, isLoading } = useAlarmsStrategy(params);

  useEffect(() => {
    if (params.dataloggerId && params.businessUuid) {
      fetchDataloggerById(params.dataloggerId, params.businessUuid);
    }
    if (params.businessUuid){
      fetchLocationById(params.businessUuid);
    }
      if (params.userId  ){
        fetchUserById(params.userId, params.businessUuid);
      }
  }, [params.dataloggerId, params.businessUuid, fetchDataloggerById]);

  // Manejo de roles
  const userCurrentRole = user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === params.businessUuid)?.role;

  const handleAlarmClick = (row) => {
    // Nota: Ajusté la URL para que sea dinámica según dónde estés, o absoluta si prefieres    
    navigate(row.url);
  };

  if (isLoading || isLoadingDatalogger || isLoadingLocation || isLoadingUser) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  console.log('Alarms to display:', alarms);
  //console.log('selectedDatalogger:', selectedDatalogger);
  //console.log('selectedLocation', selectedLocation);
  //console.log('selected User', selectedUser);
  

  return (
    <>    
      <Title1 type="alarmas" text={title} />
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Usted se encuentra en la pagina para ver todas las {title}.<br/><br/>
            Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            En esta pagina puede: <strong> Ver el listado de alarmas</strong>, algunos datos y/o hacer <strong>click para ver mas</strong> datos de una alarma. <br/><br/>
            Y tambien puede <strong>agregar una nueva alarma</strong> .<br/><br/>
            Una alarma puede estar controlado a uno o varios canales. 
            Dentro de cada alarma podra ver a que canal/es controla, como asi tambien el historial de disparos de la misma, con las correspondiente notificaciones y soluciones reportadas.<br/><br/>
            Puede ver el listado de alarmas, buscar, ver u ocultar las alarmas archivadas segun sea necesario.
          </p>          
        </>
        : <p className={styles.description}>
            Usted se encuentra en la pagina para ver todas las {title}.<br/><br/>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
      <Breadcrumb 
        // Pasamos los nombres reales si existen en los stores
        usuario={`${selectedUser?.first_name} ${selectedUser?.last_name}` || 'Desconocido'}
        ubicacion={selectedLocation?.name || 'Desconocida'}
        datalogger={selectedDatalogger?.name || 'Desconocido'}
        canal={selectedDatalogger?.channels?.find(ch => ch.uuid === params.channelId)?.name  || 'Desconocido'}
      />   

      {/* Renderizamos la lista de alarmas */}      
      <ChannelAlarms 
        businessUuid={params.businessUuid}
        alarms={alarms} 
        channelId={params.channelId}
        dataloggerId={params.dataloggerId || selectedDatalogger?.uuid}
        onAlarmClick={handleAlarmClick}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />      
    </>
  );
};

export default ViewAlarms;
