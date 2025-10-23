import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import CardImage from '../../components/CardImage/CardImage';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import styles from './ViewChannel.module.css';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';
import DigitalPorcentageOn from '../../components/Graphics/DigitalPorcentageOn/DigitalPorcentageOn';
import AnalogData from '../../components/Graphics/AnalogData/AnalogData';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ChannelInfo from '../../components/ChannelInfo/ChannelInfo';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';
import { useDataStore } from '../../store/dataStore';
import { useChannelsStore } from '../../store/channelsStore';
import CardInfo from '../../components/CardInfo/CardInfo';
import Gauge from '../../components/Gauge/Gauge';
import { useChannelDetails } from '../../hooks/useChannelDetails';

// Definimos los rangos de tiempo personalizados para los gráficos
const customTimeRanges = [
  { hours: 1, label: '1 Hr' },
  { hours: 6, label: '6 Hrs' },
  { hours: 12, label: '12 Hrs' },
  { hours: 24, label: '1 Día' },
  { hours: 72, label: '3 Días' },
  { hours: 168, label: '1 Semana' },
  { hours: 720, label: '1 Mes' },
  { hours: 4368, label: '6 meses' },
  { hours: 8760, label: '1 Anio' },
];
const ViewChannel = () => {
  const { dataloggerId, channelId, businessUuid } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentAlarms, setCurrentAlarms] = useState([]);
  const hoursBackView = 8760; // un año
  //const [currentChannel, setCurrentChannel] = useState(null);
  //const [userCurrentRole, setUserCurrentRole] = useState(null);

  const { datalogger, isLoadingDatalogger, errorDatalogger } = useFetchDatalogger(dataloggerId, businessUuid);  
  const {fetchChannelById, loadingStates: { fetchChannelById : isLoadingChannels, updateChannel: isUpdatingChannel }} = useChannelsStore();
  const { currentChannel: selectedChannel, dataChannel, isLoading } = useChannelDetails(channelId, datalogger, hoursBackView, false);

  if (isLoadingDatalogger || isLoading || isUpdatingChannel) {
    return <LoadingSpinner message="Cargando datos..." />;
    }
    
  if (errorDatalogger) {
    return <div className={styles.error}>{errorDatalogger}</div>;
    }


  

const handleAlarmClick = (row) => {
  navigate(`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}/alarmas/${row.id}`);
}; 

const userCurrentRole = 
    user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

 
  const channelButtons = (selectedChannel?.is_active == '1') ? (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        onClick={() => setModalOpen(true)}
      />
    </>
  ) : (
    <>
      <BtnCallToAction
        text="Desarchivar"
        icon="archive-solid.svg"
        type="normal"
        onClick={() => setModalOpen(true)}
      />
      
    </>
  );
  

  // Preparar los datos para el gráfico digital
  const prepareDigitalData = (data) => {
    if (!data || !data.length) return [];
    return data.map(point => ({
      timestamp: point.fecha,
      porcentaje_encendido: point.porcentaje_encendido,
      failure: false // Se anula la detección de fallas de comunicación
    }));
  };
  
  //console.log('selectedChannel', selectedChannel);
  
  
  return (
    <>
    <ModalSetArchive
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        entidad="canal"
        entidadId={selectedChannel?.uuid}
        nuevoEstado={selectedChannel?.is_active == '1' ? 0 : 1}
        /* {`/panel/ubicaciones/${businessUuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}`} */
        redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/`}
        nombre={`${selectedChannel?.name}`}
        businessUuid={businessUuid}
      />     
      <Title1 type="canales" text={`Canal ${selectedChannel?.name}`}/>
      <Breadcrumb 
        ubicacion={datalogger?.business.name}
        datalogger={datalogger?.name}
        canal={selectedChannel?.name}
      />
      <div className={styles.cardsContainer}>
          <CardImage
            image={`${selectedChannel?.img}`}
            title={selectedChannel?.name}
            buttons={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator' ? channelButtons : ''}
          >
            {selectedChannel?.is_active == '0'
              ? (<CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />)
              : ''
          }
            <ChannelInfo 
              channel={selectedChannel} 
              alarms={currentAlarms.filter(alarm => alarm.is_active == '1')} 
              datalogger={datalogger}
            />
          </CardImage>
      </div>
      <Title2 text="Alarmas Configuradas" type="alarmas"/>

      {datalogger &&
        <ChannelAlarms 
        businessUuid={businessUuid}
        alarms={currentAlarms}
        channelId={channelId}
        channelName={selectedChannel?.name}
        dataloggerId={dataloggerId}
        onAlarmClick={handleAlarmClick}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />}

       <div className={styles.chartContainer}>
        {dataChannel && dataChannel?.length > 0 ? (
          selectedChannel?.column_name.startsWith('d') ? (
            <DigitalPorcentageOn
              data={prepareDigitalData(dataChannel)}
              currentChannelName={selectedChannel?.name}
              currentChannelTimeProm={selectedChannel?.averaging_period}
              customTimeRanges={customTimeRanges}
            />
          ) : selectedChannel?.column_name.startsWith('a') ? (
            <AnalogData
              data={dataChannel}
              mult={selectedChannel?.factor}
            />
          ) : (
            <p className={cardInfoStyles.noData}>Tipo de canal no soportado</p>
          )
        ) : (
          <p className={cardInfoStyles.noData}>No hay datos disponibles</p>
        )}
      </div>
      
    </>
    );
   
  
};

export default ViewChannel;
