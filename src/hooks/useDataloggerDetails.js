import { useState, useEffect } from 'react';
import { useDataloggersStore } from '../store/dataloggersStore';
import { useChannelsStore } from '../store/channelsStore';
import { useAlarmsStore } from '../store/alarmsStore';
import { useLocationsStore } from '../store/locationsStore';
import { useDataStore } from '../store/dataStore';
import { useAuthStore } from '../store/authStore';

export const useDataloggerDetails = (dataloggerId, hoursBackView = 120) => {
  const [currentDatalogger, setCurrentDatalogger] = useState(null);
  const [dataloggerChannels, setDataloggerChannels] = useState([]);
  const [dataloggerAlarms, setDataloggerAlarms] = useState([]);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = useAuthStore(state => state.user);

  const { 
    fetchDataloggerById,
    loadingStates: { fetchDatalogger: isLoadingDatalogger }
  } = useDataloggersStore();

  const {
    channels,
    loadingStates: { fetchChannels: isLoadingChannels },
    fetchChannels
  } = useChannelsStore();

  const {
    alarms,
    loadingStates: { fetchAlarmsByLocation: isLoadingAlarms },    
    fetchAlarmsByLocation
  } = useAlarmsStore();

  const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    fetchLocations
  } = useLocationsStore();

  const { fetchDataChannel } = useDataStore();

  // Cargar datalogger
  useEffect(() => {
    const loadDatalogger = async () => {
      try {
        const datalogger = await fetchDataloggerById(dataloggerId);
        if (!datalogger) {
          throw new Error('No se pudo cargar el datalogger');
        }
        setCurrentDatalogger(datalogger);
      } catch (err) {
        setError(err.message || 'Error al cargar el datalogger');
      }
    };

    if (dataloggerId) {
      loadDatalogger();
    }
  }, [dataloggerId]);

  // Cargar canales cuando tenemos el usuario
  useEffect(() => {
    const loadChannels = async () => {
      if (user) {
        try {
          await fetchChannels(user);
        } catch (err) {
          console.error('Error cargando canales:', err);
          setError(err.message || 'Error al cargar los canales');
        }
      }
    };
    loadChannels();
  }, [user]);

  // Cargar alarmas cuando se tiene el datalogger
  useEffect(() => {
    const loadAlarms = async () => {
      if (currentDatalogger?.ubicacion_id) {
        try {
          const fetchedAlarms = await fetchAlarmsByLocation(currentDatalogger.ubicacion_id);
          if (Array.isArray(fetchedAlarms)) {
            const filteredAlarms = fetchedAlarms.filter(alarm => alarm.datalogger_id == currentDatalogger.id);
            setDataloggerAlarms(filteredAlarms);
          } else {
            setDataloggerAlarms([]);
          }
        } catch (err) {
          console.error('Error cargando alarmas:', err);
          setError(err.message || 'Error al cargar las alarmas');
          setDataloggerAlarms([]);
        }
      }
    };
    loadAlarms();
  }, [currentDatalogger]);

  // Cargar y procesar canales del datalogger actual
  useEffect(() => {
    const loadChannelsData = async () => {
      if (currentDatalogger && channels && channels.length > 0) {
        try {
          const filteredChannels = channels.filter(
            channel => channel.datalogger_id === currentDatalogger.id
          );

          const channelsWithData = await Promise.all(
            filteredChannels.map(async (channel) => {
              const nombreTabla = currentDatalogger.nombre_tabla;
              const nombreColumna = channel.nombre_columna;
              const minutosAtras = hoursBackView * 60;
              const tiempoPromedio = channel?.tiempo_a_promediar || 15;

              const channelData = await fetchDataChannel(
                nombreTabla,
                nombreColumna,
                minutosAtras,
                tiempoPromedio
              );

              return {
                ...channel,
                data: channelData
              };
            })
          );

          setDataloggerChannels(channelsWithData);
        } catch (err) {
          console.error('Error cargando datos de canales:', err);
          setError(err.message || 'Error al cargar los datos de los canales');
          setDataloggerChannels([]);
        }
      } else {
        setDataloggerChannels([]);
      }
    };

    loadChannelsData();
  }, [currentDatalogger, channels, hoursBackView]);

  // Actualizar ubicación cuando cambia el datalogger
  useEffect(() => {
    if (currentDatalogger && locations) {
      const locationData = locations.find(loc => loc.ubicaciones_id === currentDatalogger.ubicacion_id);
      setLocation(locationData);
    }
  }, [currentDatalogger, locations]);

  // Actualizar estado de carga
  useEffect(() => {
    setIsLoading(
      isLoadingDatalogger || 
      isLoadingChannels || 
      isLoadingAlarms || 
      isLoadingLocations
    );
  }, [isLoadingDatalogger, isLoadingChannels, isLoadingAlarms, isLoadingLocations]);

  // Obtener conteo de canales
  const getChannelCounts = () => {
    if (!dataloggerChannels) return { analog: 0, digital: 0 };
    
    return dataloggerChannels.reduce((acc, channel) => {
      if (channel.nombre_columna.startsWith('d')) {
        acc.digital++;
      } else {
        acc.analog++;
      }
      return acc;
    }, { analog: 0, digital: 0 });
  };

  return {
    currentDatalogger,
    dataloggerChannels,
    dataloggerAlarms,
    location,
    isLoading,
    error,
    channelCounts: getChannelCounts(),
    refreshDatalogger: () => fetchDataloggerById(dataloggerId).then(setCurrentDatalogger)
  };
}; 