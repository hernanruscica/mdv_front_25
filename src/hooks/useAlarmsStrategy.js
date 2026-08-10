import { useEffect, useMemo } from 'react';
import { useAlarmsStore } from '../store/alarmsStore';
import { useDataloggersStore } from '../store/dataloggersStore';
import { useChannelsStore } from '../store/channelsStore';
import { useAuthStore } from '../store/authStore';

export const useAlarmsStrategy = ({ businessUuid, userId, dataloggerId, channelId, userUuid }) => {
  const { 
    alarms, 
    loadingStates, 
    fetchAlarms,    
    fetchAlarmsByLocation, 
    fetchAlarmsByDatalogger,
    fetchAlarmsByChannel,
    fetchAlarmsByUser, 
    fetchAlarmsByUserUuid,
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
    if (userUuid) return 'USER_UUID';
    if (businessUuid) return 'LOCATION';
    return 'UNKNOWN';
  }, [channelId, dataloggerId, userId, userUuid, businessUuid]);

  // 2. Títulos y Datos derivados (Sin useState)
  const viewInfo = useMemo(() => {
    switch (strategy) {
      case 'CHANNEL':
        return { 
          title: `Alarmas configuradas del Canal actual`,
          context: 'canal'
        };
      case 'DATALOGGER':
        return { 
          title: `Alarmas configuradas del Datalogger actual`,
          context: 'datalogger'
        };
      case 'USER':
        return { 
          title: 'Alarmas configuradas del Usuario actual',
          context: 'usuario'
        };
      case 'USER_UUID':
        return { 
          title: 'Alarmas configuradas asignadas al usuario',
          context: 'usuario_uuid'
        };
      case 'LOCATION':
        return { 
          title: 'Alarmas configuradas de la Ubicación actual',
          context: 'ubicacion'
        };
      default:
        return { title: 'Alarmas', context: 'general' };
    }
  }, [strategy, currentChannel, selectedDatalogger]);

  

  // 3. Efecto para cargar los datos según la estrategia
  useEffect(() => {
    if (userUuid) {
      fetchAlarmsByUserUuid(userUuid);
      return;
    }

    if (!businessUuid) return;

    switch (strategy) {
      case 'CHANNEL':
        fetchAlarmsByChannel(businessUuid, channelId);
        break;
      case 'DATALOGGER':
        fetchAlarmsByDatalogger(businessUuid, dataloggerId); 
        break;
      case 'USER':
        fetchAlarmsByUser(userId, businessUuid);
        break;
      case 'LOCATION':
        fetchAlarmsByLocation(businessUuid);        
        break;
    }
  }, [strategy, businessUuid, userId, dataloggerId, channelId, userUuid]);



  return {
    alarms,
    title: viewInfo.title,
    context: viewInfo.context,
    isLoading: loadingStates.fetchAlarms || loadingStates.fetchAlarmsByChannel || loadingStates.fetchAlarmsByDatalogger || loadingStates.fetchAlarmsByUserUuid, 
  };
};