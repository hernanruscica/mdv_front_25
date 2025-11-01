
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';

import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';
import { useChannelsStore } from '../../store/channelsStore';
import { useChannelDetails } from '../../hooks/useChannelDetails';

// Definimos los rangos de tiempo personalizados para los gráficos
const customTimeRanges = [
  { hours: 1, label: '1 Hr' },
  { hours: 6, label: '6 Hrs' },
  { hours: 12, label: '12 Hrs' },
  { hours: 24, label: '1 Día' },
  { hours: 72, label: '3 Días' },
  { hours: 168, label: '1 Semana' },
  { hours: 720, label: '1 Mes' },
  { hours: 4368, label: '6 meses' },
  { hours: 8760, label: '1 Anio' },
];
const ViewChannel = () => {
  const { dataloggerId, channelId, businessUuid } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
 
  const hoursBackView = 8760; // un año 

  const { datalogger, isLoadingDatalogger, errorDatalogger } = useFetchDatalogger(dataloggerId, businessUuid);  
  const {fetchChannelById, loadingStates: { fetchChannelById : isLoadingChannels, updateChannel: isUpdatingChannel }} = useChannelsStore();
  const { currentChannel: selectedChannel, dataChannel, isLoading } = useChannelDetails(channelId, datalogger, hoursBackView, false);

  if (isLoadingDatalogger || isLoading || isUpdatingChannel) {
    return <LoadingSpinner message="Cargando datos..." />;
    }
    
  if (errorDatalogger) {
    return <div className={styles.error}>{errorDatalogger}</div>;
    }


  

const handleAlarmClick = (row) => {
  navigate(`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}/alarmas/${row.id}`);
}; 

const userCurrentRole = 
    user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

const seletedChannelAlarms = datalogger?.alarms.filter(al => al.channel_uuid === selectedChannel?.uuid); 
  
  return (
    <>    
      <Title1 type="alarmas" text={`Alarmas del canal "${selectedChannel?.name}"`}/>
      <Breadcrumb 
        ubicacion={datalogger?.business.name}
        datalogger={datalogger?.name}
        canal={selectedChannel?.name}
      />   

      {datalogger &&
        <ChannelAlarms 
        businessUuid={businessUuid}
        alarms={seletedChannelAlarms}
        channelId={channelId}
        channelName={selectedChannel?.name}
        dataloggerId={dataloggerId}
        onAlarmClick={handleAlarmClick}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />}      
      
    </>
    );
   
  
};

export default ViewChannel;
