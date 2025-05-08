import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewLocation.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';

const ViewLocation = () => {
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  
  const { 
    fetchLocationById,
    selectedLocation: currentLocation,
    loadingStates: { fetchLocation: isLoadingLocation },    
    error: errorLocations 
  } = useLocationsStore();

  const { 
    dataloggers, 
    fetchDataloggersByLocation,
    isLoading: isLoadingDataloggers, 
    error: errorDataloggers 
  } = useDataloggersStore();

  const {
    channels,
    fetchChannels,
    isLoading: isLoadingChannels,
    error: errorChannels,
  } = useChannelsStore();

  const {
    alarms,
    fetchAlarmsByLocation,
    isLoading: isLoadingAlarms,
    error: errorAlarms
  } = useAlarmsStore(); 

  //const [currentLocation, setCurrentLocation] = useState(null);

  useEffect(() => {
    const loadLocation = async () => {
      await fetchLocationById(id);
    };
    loadLocation();
  }, [id]);

  useEffect(() => {
    const loadData = async () => {      
      if (currentLocation) {
        await fetchChannels(user);        
        await fetchAlarmsByLocation(currentLocation.id);
        await fetchDataloggersByLocation(currentLocation.id);
      }     
    };
    loadData();
  }, [currentLocation]); 

  if (isLoadingLocation || isLoadingDataloggers || isLoadingChannels || isLoadingAlarms) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorLocations || errorDataloggers || errorChannels || errorAlarms) {
    return <div className={styles.error}>
      Error: {errorLocations || errorDataloggers || errorChannels || errorAlarms}
    </div>;
  }

  const locationButtons = (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/ubicaciones/editar/${currentLocation?.id}`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        url={`/panel/ubicaciones/eliminar/${currentLocation?.id}`}
      />
    </>
  );

  const locationChannels = channels.filter(channel => 
    dataloggers.some(d => d.ubicacion_id === currentLocation.id && d.id === channel.datalogger_id)
  );

  return (
    <>
      <Title1 
        text={`Ubicación: ${currentLocation?.nombre}`}
        type="ubicaciones"
      />
      <Breadcrumb ubicacion={currentLocation?.nombre}/>
      <CardImage
        image={currentLocation?.foto ? `${import.meta.env.VITE_IMAGE_URL}/${currentLocation?.foto}` : '/images/default-location.png'}
        title={currentLocation?.nombre}
        buttons={locationButtons}
      >
        <div className={styles.locationInfo}>
          <p><strong>Descripción:</strong> {currentLocation?.descripcion}</p>
          <p><strong>Dirección:</strong> {currentLocation?.calle} {currentLocation?.calle_numero}</p>
          <p><strong>Teléfono:</strong> {currentLocation?.tel}</p>
          <p><strong>Email:</strong> {currentLocation?.email}</p>
          <p><strong>Estado:</strong> {currentLocation?.estado ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Fecha de creación:</strong> {currentLocation?.fecha_creacion ? new Date(currentLocation?.fecha_creacion).toLocaleDateString() : 'No disponible'}</p>
          
          <p><strong>Canales Activos:</strong>{" "}
            {locationChannels.length === 0 ? (
              'No hay canales activos'
            ) : (
              <CardBtnSmall 
                title={`Ver ${locationChannels.length} canales`}
                url={`/panel/ubicaciones/${currentLocation?.id}/canales`}
              />
            )}
          </p>

          <p><strong>Alarmas Activas:</strong>{" "}
            {alarms.length === 0 ? (
              'No hay alarmas activas'
            ) : (
              <CardBtnSmall 
                title={`Ver ${alarms.length} alarmas`}
                url={`/panel/ubicaciones/${currentLocation?.id}/alarmas`}
              />
            )}
          </p>
        </div>
      </CardImage>

      <Title2 text={`Dataloggers en ${currentLocation?.nombre}`} type="dataloggers"/>

      <ShowDataloggersCards
        dataloggers={dataloggers.filter(d => d.ubicacion_id === parseInt(id))}
        channels={channels}
        alarms={alarms}
        locations={[currentLocation]}
        showAddButton={user?.espropietario === 1}
      />
    </>
  );
};

export default ViewLocation;