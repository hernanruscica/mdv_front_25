import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';

const ViewDatalogger = () => {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  
  const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoading }, 
    error,
    fetchDataloggers 
  } = useDataloggersStore();

  const {
    channels,
    loadingStates: { fetchChannels: isLoadingChannels },
    fetchChannels
  } = useChannelsStore();

  const {
    alarms,
    loadingStates: { fetchAlarms: isLoadingAlarms },
    fetchAlarms
  } = useAlarmsStore();

  const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    fetchLocations
  } = useLocationsStore();

  useEffect(() => {
    if (!dataloggers || dataloggers.length === 0) {
      fetchDataloggers(user);
    }
    if (!channels || channels.length === 0) {
      fetchChannels(user);
    }
    if (!alarms || alarms.length === 0) {
      fetchAlarms(user);
    }
    if (!locations || locations.length === 0) {
      fetchLocations(user);
    }
  }, [user, dataloggers, channels, alarms, locations]);

  if (isLoading || isLoadingChannels || isLoadingAlarms || isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const datalogger = dataloggers?.find(d => d.id === parseInt(id));

  if (!datalogger) {
    return <div className={styles.error}>Datalogger no encontrado</div>;
  }

  return (
    <>
      <Title1 
        type="dataloggers"
        text={datalogger.nombre}
      />
      <Breadcrumb />
    </>
  );
};

export default ViewDatalogger;