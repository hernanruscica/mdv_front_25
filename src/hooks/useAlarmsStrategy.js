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
    fetchAlarmsByUser, 
    fetchAlarmsByDatalogger, 
    fetchAlarmsByChannel 
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
          title: `Alarmas del Canal: ${currentChannel?.name || '...'}`,
          context: 'canal'
        };
      case 'DATALOGGER':
        return { 
          title: `Alarmas del Datalogger: ${selectedDatalogger?.name || '...'}`,
          context: 'datalogger'
        };
      case 'USER':
        return { 
          title: 'Alarmas del Usuario',
          context: 'usuario'
        };
      case 'LOCATION':
        return { 
          title: 'Todas las Alarmas de la Ubicación',
          context: 'ubicacion'
        };
      default:
        return { title: 'Alarmas', context: 'general' };
    }
  }, [strategy, currentChannel, selectedDatalogger]);

  // 3. Efecto para cargar los datos según la estrategia
  useEffect(() => {
    if (!businessUuid) return;

    switch (strategy) {
      case 'CHANNEL':
        //fetchAlarmsByChannel(businessUuid, channelId);
        fetchAlarms(user, businessUuid);
        break;
      case 'DATALOGGER':
        //fetchAlarmsByDatalogger(businessUuid, dataloggerId);
        fetchAlarms(user, businessUuid);
        break;
      case 'USER':
        //fetchAlarmsByUser(user);
        fetchAlarms(user);
        break;
      case 'LOCATION':
        fetchAlarms(user, businessUuid);
        break;
    }
  }, [strategy, businessUuid, userId, dataloggerId, channelId]);

  return {
    alarms, // Las alarmas ya filtradas por el store
    title: viewInfo.title,
    context: viewInfo.context,
    isLoading: loadingStates.fetchAlarms, // O el loading general que uses
  };
};