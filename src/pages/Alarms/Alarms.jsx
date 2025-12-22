import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms'; // Quizás renombrar a AlarmsListTable
import { useAlarmsStrategy } from '../../hooks/useAlarmsStrategy'; // Importamos el hook nuevo
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';

const ViewAlarms = () => {
  const params = useParams(); // businessUuid, alarmId, userId, dataloggerId, channelId
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  // Stores para datos extra de breadcrumbs (opcional si ya los tienes en caché)
  const { selectedDatalogger, fetchDataloggerById, loadingStates } = useDataloggersStore();
  const isLoadingDatalogger = loadingStates.fetchDatalogger;
  const { currentChannel } = useChannelsStore();  

  // USAMOS EL HOOK NUEVO
  const { alarms, title, isLoading } = useAlarmsStrategy(params);

  useEffect(() => {
    if (params.dataloggerId && params.businessUuid) {
      fetchDataloggerById(params.dataloggerId, params.businessUuid);
    }
  }, [params.dataloggerId, params.businessUuid, fetchDataloggerById]);

  // Manejo de roles
  const userCurrentRole = user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === params.businessUuid)?.role;

  const handleAlarmClick = (row) => {
    // Nota: Ajusté la URL para que sea dinámica según dónde estés, o absoluta si prefieres
    navigate(`/panel/ubicaciones/${params.businessUuid}/dataloggers/${row.datalogger_id}/canales/${row.channel_id}/alarmas/${row.uuid}`);
  };

  if (isLoading || isLoadingDatalogger) {
    return <LoadingSpinner message="Cargando alarmas..." />;
  }

  //console.log('Alarms to display:', alarms);
  console.log('selectedDatalogger:', selectedDatalogger);
  

  return (
    <>    
      <Title1 type="alarmas" text={title} />
      
      <Breadcrumb 
        // Pasamos los nombres reales si existen en los stores
        ubicacion={selectedDatalogger?.business?.name || 'Desconocida'} 
        datalogger={selectedDatalogger?.name || 'Desconocido'}
        canal={selectedDatalogger?.channels?.find(ch => ch.uuid === params.channelId)?.name  || 'Desconocido'}
      />   

      {/* Renderizamos la lista de alarmas */}
      {/* Nota: He renombrado props para que sean más genéricos, adapta ChannelAlarms si es necesario */}
      <ChannelAlarms 
        businessUuid={params.businessUuid}
        alarms={alarms} 
        channelId={params.channelId}
        dataloggerId={params.dataloggerId}
        onAlarmClick={handleAlarmClick}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />      
    </>
  );
};

export default ViewAlarms;
