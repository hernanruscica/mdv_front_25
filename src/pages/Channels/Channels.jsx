import React, {useState, useEffect} from 'react';
import { useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import {Title1} from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import { useDataStore } from '../../store/dataStore';

const Channels = () => {
  const { dataloggerId } = useParams();
  const { user } = useAuthStore();
  const [currentDatalogger, setCurrentDatalogger] = useState(null);
  const [currentChannels, setCurrentChannels] = useState([]);
  const [currentAlarms, setCurrentAlarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { fetchDataloggerById, loadingStates: { fetchDatalogger: isLoadingDatalogger }, error: errorDatalogger } = useDataloggersStore();
  const { fetchChannels, channels, loadingStates: { fetchChannels: isLoadingChannels }, error: errorChannels } = useChannelsStore();
  const { fetchAlarmsByUser, alarms, loadingStates: { fetchAlarms: isLoadingAlarms }, error: errorAlarms } = useAlarmsStore();
  const { fetchDataChannel } = useDataStore();
  const hoursBackView = 120;

  useEffect(() => {
    const loadDatalogger = async () => {
      if (dataloggerId) {
        const datalogger = await fetchDataloggerById(dataloggerId);       
        if (datalogger) {
          setCurrentDatalogger(datalogger);
        }
      }
    };
    loadDatalogger();
  }, [dataloggerId, fetchDataloggerById]);

  useEffect(() => {
    const loadData = async () => {      
      if (user && currentDatalogger?.id) {        
        await fetchChannels(user);
        await fetchAlarmsByUser(user);
      }
    };
    loadData();
  }, [user, currentDatalogger, fetchChannels, fetchAlarmsByUser]); 

  useEffect(() => {
    if (channels && currentDatalogger?.id) {
      const filteredChannels = channels.filter(
        channel => channel.datalogger_id === currentDatalogger.id
      );
      setCurrentChannels(filteredChannels);
    }
  }, [channels, currentDatalogger]);

  useEffect(() => {
    if (alarms && currentDatalogger?.id) {
      const filteredAlarms = alarms.filter(
        alarm => alarm.datalogger_id === currentDatalogger.id
      );
      setCurrentAlarms(filteredAlarms);
      //console.log('Alarmas filtradas para el datalogger actual:', filteredAlarms);
    }
  }, [alarms, currentDatalogger]);

  useEffect(() => {
    if (currentChannels.length > 0) { 
      
    }
  }, [currentChannels]);

  useEffect(() => {
    const loadChannelsData = async () => {
      if (currentChannels.length > 0 && currentDatalogger) {
        const channelsWithData = await Promise.all(
          currentChannels.map(async (channel) => {
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
        
        setCurrentChannels(channelsWithData);
      }
    };
    
    loadChannelsData();
}, [currentChannels.length, currentDatalogger, fetchDataChannel]);

  const isLoading = isLoadingDatalogger || isLoadingChannels || isLoadingAlarms;
  const hasError = errorDatalogger || errorChannels || errorAlarms;

  if (isLoading) {
    return <LoadingSpinner message='Cargando datos' />
  }

  if (hasError) {
    return <div>Error: {errorDatalogger || errorChannels || errorAlarms}</div>
  }

  //console.log(currentChannels)

  return (
    <>
      <Title1 
        type="canales"
        text={`Canales del datalogger "${currentDatalogger?.nombre || ''}""`}
      />
      <Breadcrumb datalogger={currentDatalogger?.nombre || ''}/>   

      {
        (user?.espropietario === 1) && (
          <BtnCallToAction
            text="Agregar"
            icon="plus-circle-solid.svg"
            type="normal"
            url={`/panel/dataloggers/${currentDatalogger?.id}/canales/agregar`}
          />
        )
      }

      <ShowChannelsCards
        channels={currentChannels}
        alarms={currentAlarms}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={false}
      />
    </>
  );
};

export default Channels;