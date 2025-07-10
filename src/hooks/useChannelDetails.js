import { useState, useEffect } from 'react';
import { useChannelsStore } from '../store/channelsStore';
import { useAlarmsStore } from '../store/alarmsStore';
import { useDataStore } from '../store/dataStore';

export const useChannelDetails = (channelId, hoursBackView = 120, isSecondary = false) => {
  const [currentChannel, setCurrentChannel] = useState(null);
  const [channelAlarms, setChannelAlarms] = useState([]);
  const [channelMainAlarm, setChannelMainAlarm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const { 
    fetchChannelById, 
    loadingStates: { fetchChannel: isLoadingChannel }, 
    errorChannel 
  } = useChannelsStore();

  const { 
    fetchAlarmsByChannel, 
    alarms,
    loadingStates: { fetchAlarmsByChannel: isLoadingAlarmsByChannel }, 
    error: errorAlarms 
  } = useAlarmsStore();

  const { 
    fetchDataChannel,
    dataChannel,
    dataChannelSecondary,
    loadingStates: { fetchData: isLoadingData }
  } = useDataStore();

  // Cargar canal
  useEffect(() => {
    const loadChannel = async () => {
      try {
        const channel = await fetchChannelById(channelId);
        setCurrentChannel(channel);
      } catch (err) {
        setError(err.message || 'Error al cargar el canal');
      }
    };

    if (channelId) {
      loadChannel();
    }
  }, [channelId]);

  // Cargar alarmas
  useEffect(() => {
    const loadAlarms = async () => {
      if (currentChannel) {
        try {
          await fetchAlarmsByChannel(currentChannel.id);
        } catch (err) {
          setError(err.message || 'Error al cargar las alarmas');
        }
      }
    };
    loadAlarms();
  }, [currentChannel]);

  // Filtrar alarmas del canal
  useEffect(() => {
    if (alarms && currentChannel) {
      const filteredAlarms = alarms.filter(alarm => alarm.canal_id === currentChannel.id);
      setChannelAlarms(filteredAlarms);
      setChannelMainAlarm(filteredAlarms.find(alarm => alarm.tipo_alarma == 'PORCENTAJE_ENCENDIDO' && alarm.estado == '1') || null);
    }
  }, [alarms, currentChannel]);

  // Cargar datos del canal
  useEffect(() => {
    const loadData = async () => {
      if (currentChannel) {
        try {
          const nombreTabla = currentChannel.datalogger_nombre_tabla;
          const nombreColumna = currentChannel.nombre_columna;
          const minutosAtras = hoursBackView * 60;
          const tiempoPromedio = currentChannel.tiempo_a_promediar;
          await fetchDataChannel(nombreTabla, nombreColumna, minutosAtras, tiempoPromedio, isSecondary);
        } catch (err) {
          setError(err.message || 'Error al cargar los datos del canal');
        }
      }
    };
    loadData();
  }, [currentChannel, hoursBackView, isSecondary]);

  // Actualizar estado de carga
  useEffect(() => {
    setIsLoading(isLoadingChannel || isLoadingAlarmsByChannel || isLoadingData);
  }, [isLoadingChannel, isLoadingAlarmsByChannel, isLoadingData]);

  // Actualizar estado de error
  useEffect(() => {
    setError(errorChannel || errorAlarms || null);
  }, [errorChannel, errorAlarms]);

  return {
    currentChannel,
    channelAlarms,
    channelMainAlarm,
    dataChannel: isSecondary ? dataChannelSecondary : dataChannel,
    isLoading,
    error,
    refreshChannel: () => fetchChannelById(channelId).then(setCurrentChannel)
  };
}; 