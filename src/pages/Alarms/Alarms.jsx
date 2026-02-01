import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import { useAlarmsStrategy } from '../../hooks/useAlarmsStrategy';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useUsersStore } from '../../store/usersStore';

// NUEVOS IMPORTS
import { ALARMS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const ViewAlarms = () => {
  const params = useParams(); 
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const { selectedDatalogger, fetchDataloggerById, loadingStates: { fetchDatalogger: isLoadingDatalogger } } = useDataloggersStore();
  const { selectedLocation, fetchLocationById, loadingStates: { fetchLocation: isLoadingLocation} } = useLocationsStore();
  const { selectedUser, fetchUserById, loadingStates: { fetchUser: isLoadingUser } } = useUsersStore();
  
  const { alarms, title, isLoading } = useAlarmsStrategy(params);

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, params.businessUuid);

  // Determinamos la información para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? ALARMS_LIST_INFO.Owner 
    : ALARMS_LIST_INFO.General;

  useEffect(() => {
    if (params.dataloggerId && params.businessUuid) {
      fetchDataloggerById(params.dataloggerId, params.businessUuid);
    }
    if (params.businessUuid){
      fetchLocationById(params.businessUuid);
    }
    if (params.userId){
      fetchUserById(params.userId, params.businessUuid);
    }
  }, [params.dataloggerId, params.businessUuid, params.userId, fetchDataloggerById, fetchLocationById, fetchUserById]);

  const handleAlarmClick = (row) => {
    navigate(row.url);
  };

  if (isLoading || isLoadingDatalogger || isLoadingLocation || isLoadingUser) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  return (
    <>    
      <Title1 type="alarmas" text={title} />

      {/* REEMPLAZO: Acordeón informativo centralizado */}
      <InfoAccordion data={infoData} />

      <Breadcrumb 
        usuario={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Desconocido'}
        ubicacion={selectedLocation?.name || 'Desconocida'}
        datalogger={selectedDatalogger?.name || 'Desconocido'}
        canal={selectedDatalogger?.channels?.find(ch => ch.uuid === params.channelId)?.name  || 'Desconocido'}
      />   

      <ChannelAlarms 
        businessUuid={params.businessUuid}
        alarms={alarms} 
        channelId={params.channelId}
        dataloggerId={params.dataloggerId || selectedDatalogger?.uuid}
        onAlarmClick={handleAlarmClick}
        // ACTUALIZACIÓN: Verificación con el objeto de rol
        showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
      />      
    </>
  );
};

export default ViewAlarms;