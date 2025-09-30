import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import CardImage from '../../components/CardImage/CardImage';
import CardInfo from '../../components/CardInfo/CardInfo';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import styles from './ViewChannel.module.css';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';
import DigitalPorcentageOn from '../../components/Graphics/DigitalPorcentageOn/DigitalPorcentageOn';
import AnalogData from '../../components/Graphics/AnalogData/AnalogData';
import Gauge from '../../components/Gauge/Gauge';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ChannelInfo from '../../components/ChannelInfo/ChannelInfo';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import { useChannelDetails } from '../../hooks/useChannelDetails';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';
import { useDataStore } from '../../store/dataStore';

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
  const hoursBackView = 8760; // un año

  const { datalogger, isLoadingDatalogger, errorDatalogger } = useFetchDatalogger(dataloggerId, businessUuid);  


   const { 
      fetchDataChannel,
      dataChannel,
      dataChannelSecondary,
      loadingStates: { fetchData: isLoadingData }
    } = useDataStore();
  /*
   console.log('businessUuid', businessUuid);
   console.log('dataloggerId', dataloggerId);
   console.log('channelId', channelId);  
  */
 
 const currentChannel = datalogger?.channels?.find(ch=>ch.uuid === channelId);
 const userCurrentRole = user.businesses_roles.find(br => br.uuid === businessUuid).role;

   useEffect(() => {
    const loadData = async () => {
      //fetchDataChannel: async (nombreTabla, nombreColumna, minutosAtras, tiempoPromedio, isSecondary = false)
      const responseData = await fetchDataChannel(datalogger?.table_name, currentChannel?.column_name, hoursBackView, currentChannel?.averaging_period);
      //console.log(responseData)
    }
    if (!isLoadingDatalogger){
      loadData();
    }
   }, [isLoadingDatalogger]);

  if (isLoadingDatalogger && isLoadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
    }
    
  if (errorDatalogger) {
    return <div className={styles.error}>{errorDatalogger}</div>;
    }


console.log(datalogger?.table_name);

const handleAlarmClick = (row) => {
  navigate(`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.uuid}/alarmas/${row.id}`);
};
      /*

  /*
  const {
    currentChannel,
    channelAlarms,
    channelMainAlarm,
    dataChannel,
    isLoading,
    error,
    refreshChannel
  } = useChannelDetails(channelId, hoursBackView);*/

  // // Actualizar canal después de archivar/desarchivar
  // useEffect(() => {
  //   if (!modalOpen && currentChannel?.id) {
  //     const timeout = setTimeout(() => {
  //       refreshChannel();
  //     }, 200);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [modalOpen, currentChannel?.id]);
  


  //console.log(channelAlarms);
  //console.log(channelMainAlarm);  
  /*
  */
  const channelButtons = (currentChannel?.is_active == 1) ? (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/editar`}
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
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/editar`}
      />
    </>
  );
  

  // Preparar los datos para el gráfico digital
  const prepareDigitalData = (data) => {
    if (!data || !data.length) return [];
    return data.map(point => ({
      timestamp: point.fecha,
      porcentaje_encendido: point.porcentaje_encendido,
      failure: point.tiempo_total >= 900 // 15 minutos en segundos
    }));
  };
  
  
  return (
    <>
    <ModalSetArchive
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        entidad="canal"
        entidadId={currentChannel?.uuid}
        nuevoEstado={currentChannel?.is_active == '1' ? 0 : 1}
        redirectTo={`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.uuid}`}
        nombre={`${currentChannel?.name}`}
      />     
      <Title1 type="canales" text={`Canal ${currentChannel?.name}`}/>
      <Breadcrumb 
        ubicacion={datalogger?.business.name}
        datalogger={datalogger?.name}
        canal={currentChannel?.name}
      />
      <div className={styles.cardsContainer}>
          <CardImage
            image={`${import.meta.env.VITE_IMAGE_URL}/${currentChannel?.img}`}
            title={currentChannel?.name}
            buttons={user.isOwner === 1 ? channelButtons : null}
          >
            {currentChannel?.is_active == '0' && (
              <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
            )}
            <ChannelInfo 
              channel={currentChannel} 
              alarms={datalogger?.alarms.filter(alarm => alarm.is_active == '1')} 
              datalogger={datalogger}
            />
          </CardImage>
      </div>
      <Title2 text="Alarmas Configuradas" type="alarmas"/>

      {datalogger &&
        <ChannelAlarms 
        alarms={datalogger?.alarms}
        channelId={channelId}
        channelName={currentChannel.name}
        dataloggerId={dataloggerId}
        onAlarmClick={handleAlarmClick}
        showAddButton={user.isOwner == 1 || userCurrentRole === 'Administrator'}
      />}

       <div className={styles.chartContainer}>
        {dataChannel && dataChannel?.length > 0 ? (
          currentChannel?.column_name.startsWith('d') ? (
            <DigitalPorcentageOn
              data={prepareDigitalData(dataChannel)}
              currentChannelName={currentChannel?.name}
              currentChannelTimeProm={currentChannel?.averaging_period}
              customTimeRanges={customTimeRanges}
            />
          ) : currentChannel?.nombre_columna.startsWith('a') ? (
            <AnalogData
              data={dataChannel}
              mult={currentChannel?.factor}
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


{/*}
   <>
       

        {channelMainAlarm != null && (
          <CardInfo
            iconSrc="/icons/bell-regular.svg"
            title={channelMainAlarm?.nombre || 'Sin alarma configurada'}
            url={channelMainAlarm ? `/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/alarmas/${channelMainAlarm.id}` : '#'}
          >
            <div className={cardInfoStyles.description}>            
              <p><strong>Creado el:</strong> {new Date(channelMainAlarm?.fecha_creacion).toLocaleDateString()}</p>
              <p><strong>Descripcion: </strong>{channelMainAlarm?.descripcion}</p>
              <p><strong>Condicion: </strong>{`${channelMainAlarm?.condicion_mostrar} ${channelMainAlarm?.variable01}`}</p>
              <div className={styles.gaugePlaceholder}>              
                {channelMainAlarm?.tipo_alarma == "PORCENTAJE_ENCENDIDO" && (() => {
                  const conditionOperator = channelMainAlarm.condicion.split(" ")[1];
                  const conditionValue = channelMainAlarm.variable01;  
                  const max = (conditionOperator.includes(">")) ? conditionValue : 100;
                  const min = (conditionOperator.includes("<")) ? conditionValue : 0;
                  const preparedData = prepareDigitalData(dataChannel);
                  const lastData = parseFloat(preparedData[preparedData.length - 1]?.porcentaje_encendido, 2);
                  //console.log(lastData)
                  return (
                    <Gauge 
                      currentValue={lastData}
                      alarmMin={min}
                      alarmMax={max}                              
                    />
                  );
                })()}
              </div>
            </div>
          </CardInfo>
        )}
      </div>    
    
    */}