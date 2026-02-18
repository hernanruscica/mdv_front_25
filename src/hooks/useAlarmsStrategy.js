import { useEffect, useMemo } from 'react';
import { useAlarmsStore } from '../store/alarmsStore';
import { useDataloggersStore } from '../store/dataloggersStore';
import { useChannelsStore } from '../store/channelsStore';
import { useAuthStore } from '../store/authStore';

export const useAlarmsStrategy = ({ businessUuid, userId, dataloggerId, channelId }) => {
  const { 
    alarms, 
    loadingStates, 
    // Asumimos que tu store tiene estas acciones distintas:
    fetchAlarms,    
    fetchAlarmsByLocation, 
    fetchAlarmsByDatalogger,
    fetchAlarmsByChannel,
    fetchAlarmsByUser, 
    // fetchAlarmsByDatalogger, 
    // fetchAlarmsByChannel 
  } = useAlarmsStore();

  // Stores auxiliares para obtener nombres (Breadcrumbs)
  const { selectedDatalogger } = useDataloggersStore();
  const { currentChannel } = useChannelsStore();
  const { user } = useAuthStore();

  // 1. Determinar el TIPO de vista (La Estrategia)
  const strategy = useMemo(() => {
    if (channelId) return 'CHANNEL';
    if (dataloggerId) return 'DATALOGGER';
    if (userId) return 'USER';
    if (businessUuid) return 'LOCATION';
    return 'UNKNOWN';
  }, [channelId, dataloggerId, userId, businessUuid]);

  // 2. Títulos y Datos derivados (Sin useState)
  const viewInfo = useMemo(() => {
    switch (strategy) {
      case 'CHANNEL':
        return { 
          title: `Alarmas del Canal actual`,
          context: 'canal'
        };
      case 'DATALOGGER':
        return { 
          title: `Alarmas del Datalogger actual`,
          context: 'datalogger'
        };
      case 'USER':
        return { 
          title: 'Alarmas del Usuario actual',
          context: 'usuario'
        };
      case 'LOCATION':
        return { 
          title: 'Alarmas de la Ubicación actual',
          context: 'ubicacion'
        };
      default:
        return { title: 'Alarmas', context: 'general' };
    }
  }, [strategy, currentChannel, selectedDatalogger]);

  

  // 3. Efecto para cargar los datos según la estrategia
  useEffect(() => {
    // console.log('businessUuid', businessUuid);
    //console.log('strategy', strategy);
    
    
    if (!businessUuid) return;

    switch (strategy) {
      case 'CHANNEL':
        //fetchAlarmsByChannel(businessUuid, channelId);
        //console.log('fetch alarms by channel');     
        fetchAlarmsByChannel(businessUuid, channelId);
        break;
      case 'DATALOGGER':
        //fetchAlarmsByDatalogger(businessUuid, dataloggerId);           
        fetchAlarmsByDatalogger(businessUuid, dataloggerId); 
        break;
      case 'USER':
        fetchAlarmsByUser(userId, businessUuid);
        //fetchAlarms(user);        
        break;
      case 'LOCATION':
        //console.log('case location', businessUuid);        
        fetchAlarmsByLocation(businessUuid);        
        break;
    }
  }, [strategy, businessUuid, userId, dataloggerId, channelId]);



  return {
    alarms, // Las alarmas ya filtradas por el store
    title: viewInfo.title,
    context: viewInfo.context,
    isLoading: loadingStates.fetchAlarms || loadingStates.fetchAlarmsByChannel || loadingStates.fetchAlarmsByDatalogger, 
  };
};