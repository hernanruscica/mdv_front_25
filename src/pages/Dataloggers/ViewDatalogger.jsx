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
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import Table from '../../components/Table/Table';
import { useNavigate } from 'react-router-dom';

const ViewDatalogger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams();
  const user = useAuthStore(state => state.user);
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
      //console.log('hace fetchDatalogger al endpoint')
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
        await fetchChannels(user);        
        await fetchAlarmsByLocation(currentDatalogger.ubicacion_id);        
      }     
    };
    loadData();
  }, [currentDatalogger]); 

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
    if (!channels) return { analog: 0, digital: 0 };
    
    const dataloggerChannels = channels.filter(
      channel => channel.datalogger_id === currentDatalogger.id
    );

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
        url={`/panel/dataloggers/editar/${currentDatalogger?.id}`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        url={`/panel/dataloggers/eliminar/${currentDatalogger?.id}`}
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
  console.log('dataloggersAlarms',dataloggerAlarms);
  console.log(currentDatalogger);
  //console.log('dataloggerAlarms',dataloggerAlarms);
 // console.log('preparedAlarms',preparedAlarms);

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
          <p><strong>Ubicación:</strong> {location?.ubicaciones_nombre || 'No especificada'}</p>
          <p><strong>Creado el:</strong> {new Date(currentDatalogger.fecha_creacion).toLocaleDateString()}</p>
          <p>
            <strong>Canales conectados:</strong>{" "}
            {channelCounts.analog} analógicos y {channelCounts.digital} digitales
          </p>
          <p>
            <strong>Alarmas programadas:</strong>{" "}
            <CardBtnSmall
              title={`Ver ${dataloggerAlarms.length} alarmas`}
              url={`/panel/dataloggers/${currentDatalogger.id}/alarmas`}
            />
          </p>
        </div>
      </CardImage>

      <Title2 
        text={`Canales del datalogger ${currentDatalogger.nombre}`}
        type="canales"
      />

      <ShowChannelsCards
        channels={channels.filter(channel => channel.datalogger_id === currentDatalogger.id)}
        alarms={alarms}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        showAddButton={user?.espropietario === 1}
      />

      <Title2 
        text={`Alarmas programadas en ${currentDatalogger.nombre}`}
        type="alarmas"
      />
      
      <div className={styles.tableContainer}>
        <Table 
          columns={columns}
          data={preparedAlarms}
          onRowClick={handleAlarmClick}
        />
      </div>
    </>
  );
};

export default ViewDatalogger;