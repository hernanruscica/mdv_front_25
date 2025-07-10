import { useState, useEffect } from 'react';
import { useAlarmsStore } from '../store/alarmsStore';
import { useAlarmLogsStore } from '../store/alarmLogsStore';
import { useChannelsStore } from '../store/channelsStore';
import { useDataloggersStore } from '../store/dataloggersStore';

export const useAlarmDetails = (alarmId) => {
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [alarmLogs, setAlarmLogs] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [secondaryChannel, setSecondaryChannel] = useState(null);
  const [currentDatalogger, setCurrentDatalogger] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { 
    fetchAlarmById,
    loadingStates: { fetchAlarm: isLoadingAlarm }
  } = useAlarmsStore();

  const { 
    fetchAlarmLogsByAlarmId,
    loadingStates: { fetchAlarmLogs: isLoadingLogs }
  } = useAlarmLogsStore();

  const {
    channels,
    fetchChannelById,
    loadingStates: { fetchChannel: isLoadingChannel }
  } = useChannelsStore();

  const {
    dataloggers,
    fetchDataloggerById,
    loadingStates: { fetchDatalogger: isLoadingDatalogger }
  } = useDataloggersStore();

  // Cargar alarma
  useEffect(() => {
    const loadAlarm = async () => {
      try {
        const alarm = await fetchAlarmById(alarmId);
        setCurrentAlarm(alarm);
      } catch (err) {
        setError(err.message);
      }
    };

    if (alarmId) {
      loadAlarm();
    }
  }, [alarmId]);

  // Cargar logs y canales cuando la alarma está disponible
  useEffect(() => {
    const loadChannelsAndLogs = async () => {
      if (!currentAlarm) return;

      try {
        // Cargar logs
        const logs = await fetchAlarmLogsByAlarmId(currentAlarm.id);
        setAlarmLogs(logs || []);

        // Buscar o cargar canal principal
        const channelFromStore = channels.find(c => c.canales_id === currentAlarm.canal_id);
        if (channelFromStore) {
          setCurrentChannel(channelFromStore);
        } else {
          const fetchedChannel = await fetchChannelById(currentAlarm.canal_id);
          setCurrentChannel(fetchedChannel);
        }

        // Si es una alarma de FUNCIONAMIENTO_SIMULTANEO, cargar el canal secundario
        if (currentAlarm.tipo_alarma === 'FUNCIONAMIENTO_SIMULTANEO' && currentAlarm.variable03) {
          const secondaryChannelFromStore = channels.find(c => c.canales_id === currentAlarm.variable03);
          if (secondaryChannelFromStore) {
            setSecondaryChannel(secondaryChannelFromStore);
          } else {
            const fetchedSecondaryChannel = await fetchChannelById(currentAlarm.variable03);
            setSecondaryChannel(fetchedSecondaryChannel);
          }
        }
      } catch (err) {
        setError(err.message);
      }
    };
    
    loadChannelsAndLogs();
  }, [currentAlarm, channels]);

  // Cargar datalogger cuando el canal está disponible
  useEffect(() => {
    const loadDatalogger = async () => {
      if (!currentChannel?.datalogger_id) return;

      try {
        const dataloggerFromStore = dataloggers.find(d => d.id === currentChannel.datalogger_id);
        if (dataloggerFromStore) {
          setCurrentDatalogger(dataloggerFromStore);
        } else {
          const fetchedDatalogger = await fetchDataloggerById(currentChannel.datalogger_id);
          setCurrentDatalogger(fetchedDatalogger);
        }
      } catch (err) {
        setError(err.message);
      }
    };

    loadDatalogger();
  }, [currentChannel, dataloggers]);

  // Actualizar estado de carga
  useEffect(() => {
    setIsLoading(
      isLoadingAlarm || 
      isLoadingLogs || 
      isLoadingChannel || 
      isLoadingDatalogger
    );
  }, [isLoadingAlarm, isLoadingLogs, isLoadingChannel, isLoadingDatalogger]);

  return {
    currentAlarm,
    alarmLogs,
    currentChannel,
    secondaryChannel,
    currentDatalogger,
    isLoading,
    error,
    refreshAlarm: () => fetchAlarmById(alarmId).then(setCurrentAlarm)
  };
}; 