import React, { useState,useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import {Title2} from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import  BtnCallToAction  from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataStore } from '../../store/dataStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import Table from '../../components/Table/Table';
import { useNavigate } from 'react-router-dom';

const ViewDatalogger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [dataloggerChannels, setDataloggerChannels] = useState([]);
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
  const { fetchDataChannel } = useDataStore();
  const navigate = useNavigate();
  
  const { 
    dataloggers, 
    loadingStates: { 
      fetchDataloggers: isLoading,
      fetchDatalogger: isLoadingDatalogger 
    },     
    fetchDataloggers,
    fetchDataloggerById 
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

  const [currentDatalogger, setCurrentDatalogger] = React.useState(null);

  

  useEffect(() => {
    const loadDatalogger = async (id) => {
      const currentDatalogger = await fetchDataloggerById(id);   
      setCurrentDatalogger(currentDatalogger);
    };
    
    if (!dataloggers || dataloggers.length === 0){
      loadDatalogger(id);
    }else{
      const currentDatalogger = dataloggers.find(d => d.id === parseInt(id));
      setCurrentDatalogger(currentDatalogger);
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {      
      if (currentDatalogger) {        
        const currentChannels = await fetchChannels(user);        
        await fetchAlarmsByLocation(currentDatalogger.ubicacion_id);    
      }     
    };
    loadData();
  }, [currentDatalogger]); 
  
  // Modifica el useEffect para manejar dataloggerChannels
  useEffect(() => {
    const loadData = async () => {
      if (currentDatalogger && channels) {
        // Filtra los canales para el datalogger actual
        const filteredChannels = channels.filter(
          channel => channel.datalogger_id === currentDatalogger.id
        );        
        // Busca los datos de cada canal
        const channelsWithData = await Promise.all(
          filteredChannels.map(async (channel) => {
            const nombreTabla = currentDatalogger.nombre_tabla;
            const nombreColumna = channel.nombre_columna;
            const minutosAtras = 24 * 60; 
            const tiempoPromedio = channel?.tiempo_a_promediar || 15; 
            
            const channelData = await fetchDataChannel(
              nombreTabla,
              nombreColumna,
              minutosAtras,
              tiempoPromedio
            );
            //console.log('nombreColumna',nombreColumna);
            return {
              ...channel,
              data: channelData
            };
          })
        );

        setDataloggerChannels(channelsWithData);        
      }
    };
    
    loadData();
  }, [currentDatalogger, channels.length, fetchDataChannel]);

  //     
  if (isLoadingChannels || isLoadingDatalogger || isLoadingAlarms) {
    return <LoadingSpinner message="Cargando datos..." />;
  }


  if (!currentDatalogger) {
    return <div className={styles.error}>Datalogger no encontrado</div>;
  }
  
  const location = locations?.find(loc => loc.ubicaciones_id === currentDatalogger?.ubicacion_id);
  
  // Función para contar canales analógicos y digitales
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

  const channelCounts = getChannelCounts();
  const dataloggerAlarms = alarms?.filter(alarm => alarm.datalogger_id === currentDatalogger?.id) || [];

  const dataloggerButtons = (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/dataloggers/${currentDatalogger?.id}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        url={`/panel/dataloggers/${currentDatalogger?.id}/archivar`}
      />
    </>
  );

  const getChannelName = (channelId) => {
    const channel = channels?.find(ch => ch.canales_id === channelId);
    return channel ? channel.canales_nombre : 'Canal no encontrado';
  };

  const columns = [
    { label: 'NOMBRE DE LA ALARMA', accessor: 'nombreAlarma' },
    { label: 'NOMBRE DEL CANAL', accessor: 'nombreCanal' },
    { label: 'CONDICIÓN', accessor: 'condicion' }
  ];

  const handleAlarmClick = (row) => {
    navigate(`/panel/dataloggers/${currentDatalogger.id}/canales/${row.canalId}/alarmas/${row.id}`);
  };

  const preparedAlarms = dataloggerAlarms.map(alarm => ({
    nombreAlarma: alarm.nombre,
    nombreCanal: getChannelName(alarm.canal_id),
    condicion: alarm.condicion || 'Sin condición',
    canalId: alarm.canal_id,
    id: alarm.id  // Aquí está el cambio clave
  }));  

  console.log('dataloggerChannels',dataloggerChannels);

  return (
    <>
      <Title1 
        type="dataloggers"
        text={currentDatalogger.nombre}
      />
      <Breadcrumb datalogger={currentDatalogger.nombre}/>
      <CardImage
        image={currentDatalogger.foto ? `${import.meta.env.VITE_IMAGE_URL}/${currentDatalogger.foto}` : '/images/default-datalogger.webp'}
        title={currentDatalogger.nombre}
        buttons={dataloggerButtons}
      >
        <div className={styles.dataloggerInfo}>
          <p className={styles.description}>{currentDatalogger.descripcion}</p>
          <p><strong>MAC:</strong> {currentDatalogger.direccion_mac}</p>
          <p><strong>Ubicación:</strong> {
            (location) ?
            <CardBtnSmall
              title={location.ubicaciones_nombre}
              url={`/panel/ubicaciones/${location.ubicaciones_id}`} />
              : 'No especificada'
          }</p>
          <p><strong>Creado el:</strong> {new Date(currentDatalogger.fecha_creacion).toLocaleDateString()}</p>
          <p>
            <strong>Canales conectados:</strong>{" "}
            {channelCounts.analog} analógicos y {channelCounts.digital} digitales
          </p>
          <p>
            <strong>Alarmas programadas:</strong>{" "}
            {(dataloggerAlarms && dataloggerAlarms.length > 0)?
            <CardBtnSmall
              title={`Ver ${dataloggerAlarms.length} alarmas`}
              url={`/panel/dataloggers/${currentDatalogger.id}/alarmas`}
            />
            : 'No hay alarmas programadas'
            }
          </p>
        </div>
      </CardImage>

      <Title2 
        text={`Canales del datalogger ${currentDatalogger.nombre}`}
        type="canales"
      />
      
      {/*Si es propietario puede agregar canales al datalogger */
      (user.espropietario == 1) &&      
       <BtnCallToAction
            text="Agregar canal"
            icon="plus-circle-solid.svg"
            type="normal"
            url={`/panel/dataloggers/${currentDatalogger.id}/canales/agregar`}
        />
      }{
      (dataloggerChannels && dataloggerChannels.length > 0) ?
        <ShowChannelsCards
          channels={dataloggerChannels}
          alarms={alarms}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={false}
        />
        : 'No hay canales todavia'
      }
      <Title2 
        text={`Alarmas programadas en ${currentDatalogger.nombre}`}
        type="alarmas"
      />      
      
      {/* <BtnCallToAction
            text={`Ver ${dataloggerAlarms.length} alarmas`}
            icon="bell-regular.svg"
            type="normal"
            url={`/panel/dataloggers/${currentDatalogger.id}/alarmas`}
        /> */}
      
      { (preparedAlarms && preparedAlarms.length > 0) ? 
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedAlarms}
            onRowClick={handleAlarmClick}
          />
        </div>
      : (<p className={styles.description}>Este datalogger todavia no tiene alarmas, para agregar una primero tiene que elegir un canal.</p>)
      }
    </>
  );
};

export default ViewDatalogger;