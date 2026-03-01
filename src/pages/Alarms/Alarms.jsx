import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
// import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import { Title1 } from '../../components/Title1/Title1';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import { useAlarmsStrategy } from '../../hooks/useAlarmsStrategy';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useUsersStore } from '../../store/usersStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import ModalSubscribeUserAlarm from '../../components/ModalSubscribeUserAlarm/ModalSubscribeUserAlarm';

import { ALARMS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const ViewAlarms = () => {
  const params = useParams(); 
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const { selectedDatalogger, fetchDataloggerById, loadingStates: { fetchDatalogger: isLoadingDatalogger } } = useDataloggersStore();
  const { selectedLocation, fetchLocationById, loadingStates: { fetchLocation: isLoadingLocation} } = useLocationsStore();
  const { selectedUser, fetchUserById, loadingStates: { fetchUser: isLoadingUser }, users: allBusinessUsers, fetchUsers } = useUsersStore();
  const { fetchAlarmsForSubscription, fetchAlarmsByUserUuid } = useAlarmsStore();
  
  const { alarms, title, isLoading, context } = useAlarmsStrategy(params);

  // Detectar si es la ruta de "mis alarmas" (userUuid)
  const isMisAlarmasRoute = !!params.userUuid;

  // Obtener el businessUuid para la vista de "mis alarmas"
  const businessUuidForMisAlarmas = isMisAlarmasRoute ? user?.businesses_roles?.[0]?.uuid : params.businessUuid;
  const currentBusinessUuid = businessUuidForMisAlarmas || params.businessUuid;

  // Estado para el modal de suscripción
  const [modalSubscribeOpen, setModalSubscribeOpen] = useState(false);
  const [availableAlarmsForSubscription, setAvailableAlarmsForSubscription] = useState([]);

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, currentBusinessUuid);

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
    // Cargar usuarios del negocio para el modal de suscripción
    if (isMisAlarmasRoute && user && currentBusinessUuid) {
      fetchUsers(user, currentBusinessUuid);
    }
  }, [params.dataloggerId, params.businessUuid, params.userId, fetchDataloggerById, fetchLocationById, fetchUserById, fetchUsers, isMisAlarmasRoute, currentBusinessUuid, user]);

  const handleAlarmClick = (row) => {
    navigate(row.url);
  };

  const handleOpenSubscribeModal = async () => {
    // Obtener los UUIDs de las alarmas ya suscritas
    const subscribedAlarmIds = (alarms || []).map(a => a.alarm_uuid || a.uuid);
    console.log('suscribedAlarmIds:', subscribedAlarmIds);
    
    const alarmsData = await fetchAlarmsForSubscription(currentBusinessUuid);
    console.log('total alarms from business:', alarmsData?.length);
    console.log('subscribed alarms:', alarms?.length);
    
    // Filtrar las alarmas que ya están suscritas
    const availableForSubscription = (alarmsData || []).filter(alarm => 
      !subscribedAlarmIds.includes(alarm.uuid) && 
      !subscribedAlarmIds.includes(alarm.alarm_uuid)
    );
    console.log('available for subscription:', availableForSubscription?.length);
    
    setAvailableAlarmsForSubscription(availableForSubscription);
    setModalSubscribeOpen(true);
  };

  const handleSubscribeSuccess = () => {
    fetchAlarmsByUserUuid(isMisAlarmasRoute ? user?.uuid : selectedUser?.uuid);
  };

  if (isLoading || isLoadingDatalogger || isLoadingLocation || isLoadingUser) {
    return <LoadingSpinner message="Cargando datos..." />;
  }
//console.log('selecteduser', selectedUser);

  return (
    <>    
      <Title1 type="alarmas" text={`${title} ${isMisAlarmasRoute ? `${user.first_name} ${user.last_name}` : ''}`} />

      <InfoAccordion data={infoData} />

      {/* <Breadcrumb 
        usuario={isMisAlarmasRoute ? null : (selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Desconocido')}
        ubicacion={selectedLocation?.name || 'Desconocida'}
        datalogger={selectedDatalogger?.name || 'Desconocido'}
        canal={selectedDatalogger?.channels?.find(ch => ch.uuid === params.channelId)?.name || 'Desconocido'}
        alarma={isMisAlarmasRoute ? `${user.first_name} ${user.last_name}` : null}
      />    */}
      <BreadcrumbAuto />

      <ChannelAlarms 
        businessUuid={currentBusinessUuid}
        alarms={alarms} 
        channelId={params.channelId}
        dataloggerId={params.dataloggerId || selectedDatalogger?.uuid}
        onAlarmClick={handleAlarmClick}        
        showAddButton={isMisAlarmasRoute || userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
        isMisAlarmasRoute={isMisAlarmasRoute}
        onSubscribeClick={handleOpenSubscribeModal }
      />      

      
      <ModalSubscribeUserAlarm
        isOpen={modalSubscribeOpen}
        onRequestClose={() => setModalSubscribeOpen(false)}
        businessUuid={currentBusinessUuid}
        alarmUuid={null}
        allUsers={allBusinessUsers}
        subscribedUserIds={alarms?.map(a => a.alarm_uuid) || []}
        currentUserRole={userCurrentRole?.name}
        onSuccess={handleSubscribeSuccess}
        isMyAlarmsView={true}
        targetUserUuid={isMisAlarmasRoute ? user?.uuid : selectedUser?.uuid}
        availableAlarmsForSubscription={availableAlarmsForSubscription}
      />
      
    </>
  );
};

export default ViewAlarms;
