import React, { useEffect } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';
import styles from './Dataloggers.module.css';

const Dataloggers = () => {
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
  }, [user]);

  if (isLoading || isLoadingChannels || isLoadingAlarms || isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  console.log(dataloggers);

  return (
    <>
      <Title1 
        type="dataloggers"
        text="Dataloggers" 
      />
      <Breadcrumb />
      <ShowDataloggersCards
        dataloggers={dataloggers}
        channels={channels}
        alarms={alarms}
        locations={locations}
        showAddButton={user.espropietario === 1}
      />
    </>
  );
};

export default Dataloggers;