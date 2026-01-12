import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import CardImage from '../../components/CardImage/CardImage';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import styles from './ViewChannel.module.css';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ChannelInfo from '../../components/ChannelInfo/ChannelInfo';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useDataStore } from '../../store/dataStore';
import { useAlarmLogsStore } from '../../store/alarmLogsStore';
import ViewChart from '../../components/ViewChart/ViewChart';
import { RANGE_KEYS } from '../../components/ViewChart/constants/chartRanges';
//import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

const ViewChannel = () => {
  const { businessUuid, dataloggerId, channelId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [modalOpen, setModalOpen] = useState(false);  
  const [currentAlarmsLogs, setCurrentAlarmsLogs] = useState([]);
  const [alarmLogsComunicationFailure, setAlarmLogsComunicationFailure] = useState([]);

   
  const { fetchChannelById, 
          selectedChannel, 
          loadingStates: { fetchChannel: isLoadingChannel, updateChannel: isUpdatingChannel },
          error: errorChannel
        } = useChannelsStore();

  const { alarms,
          fetchAlarmsByChannel,
          loadingStates : {
            fetchAlarmsByChannel : isLoadingAlarmsByChannel
          },
          error : errorLoadindAlarms
        } = useAlarmsStore();
  
   const { fetchChannelUsage,          
          channelUsage,
          loadingStates: {             
            fetchChannelUsage: isLoadingChannelUsage,
          },
          error: errorLoadingChannelUsage
        } = useDataStore();
  
    const {
      alarmLogs,
      alarmLogsDatalogger,
      fetchAlarmLogsByAlarmId,
      fetchAlarmLogsByDataloggerId,
      loadingStates: { fetchAlarmLogs: isLoadingAlarmLogs, fetchAlarmLogsByDataloggerId: isLoadingAlarmLogsByDataloggerId },
      error: errorLoadingAlarmLogs
    } = useAlarmLogsStore();


  useEffect(() => {
  const loadData = async () => {
    // 1. Corrección: Usar && para verificar que ambos existan
    if (businessUuid && channelId) {
      try {
        const currentChannel = await fetchChannelById(channelId, businessUuid);
        const currentAlarms = await fetchAlarmsByChannel(businessUuid, channelId);
        
        //console.log('currentAlarms', currentAlarms);
        
        await fetchChannelUsage(businessUuid, currentChannel?.datalogger.uuid, channelId);

        const alarmLogsByDatalogger = await fetchAlarmLogsByDataloggerId(businessUuid, currentChannel?.datalogger.uuid);
        setAlarmLogsComunicationFailure(alarmLogsByDatalogger?.filter(log => log.alarm_type === "comunication_failure"));

        // 2. Creamos el array de promesas mapeando las alarmas
        const promises = currentAlarms.map(async (alarm) => {
          // Hacemos el fetch individual
          const logs = await fetchAlarmLogsByAlarmId(businessUuid, alarm.uuid);
          
          // 3. Retornamos el objeto con la estructura que pediste
          return { 
            uuid: alarm.uuid, 
            logs: logs 
          };
        });

        // 4. Esperamos a que todas se resuelvan y GUARDAMOS el resultado en una variable
        const alarmsWithLogs = await Promise.all(promises);

        //console.log('Array final:', alarmsWithLogs);
        
        // Aquí seguramente quieras guardar esto en un estado:
        setCurrentAlarmsLogs(alarmsWithLogs);

      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    }
  };

  loadData();
}, [businessUuid, channelId]);


  if (isLoadingChannel || isUpdatingChannel || isLoadingAlarmsByChannel      
      || isLoadingChannelUsage || isLoadingAlarmLogs || isLoadingAlarmLogsByDataloggerId) {
    return <LoadingSpinner message="Cargando datos..." />;
    }
    
  if (errorChannel || errorLoadingChannelUsage || errorLoadindAlarms || errorLoadingAlarmLogs) {
    return <div className={styles.error}>Error Cargando los datos</div>;
    }
  

const handleAlarmClick = (row) => {
  navigate(`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger.uuid}/canales/${selectedChannel?.uuid}/alarmas/${row.id}`);
}; 

const userCurrentRole = 
    user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;




const seletedChannelAlarms = alarms.filter(al => al.channel_uuid === selectedChannel?.uuid);
      
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
    
  //console.log('selectedChannel', selectedChannel);
  //console.log('alarms by channel', seletedChannelAlarms);  
  //console.log('channelAllRegistersData :', channelAllRegistersData);
  //console.log('channelUsage', channelUsage);
  //console.log('currentAlarmsLogs', currentAlarmsLogs); alarm_type: "comunication_failure"
  console.log('alarmLogsComunicationFailure', alarmLogsComunicationFailure);
  
  
  
  
  
  return (
    <>
    <ModalSetArchive
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        entidad="canal"
        entidadId={selectedChannel?.uuid}
        nuevoEstado={selectedChannel?.is_active == '1' ? 0 : 1}       
        redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/`}
        nombre={`${selectedChannel?.name}`}
        businessUuid={businessUuid}
      />     
      <Title1 type="canales" text={`Canal ${selectedChannel?.name}`}/>
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Usted se encuentra en la pagina para ver mas detalles del canal seleccionado.<br/><br/>
            Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            En esta pagina puede: <strong> Agregar nuevas alarmas, editar y/o archivar el canal</strong> actual. <br/><br/>
            Un canal puede tener varias alarmas, de distintos tipos asociadas.<br/><br/>
            Puede buscar una alarma, ver u ocultar las archivadas segun sea necesario. Tambien puede ver el grafico de datos del canal seleccionado.
          </p>          
        </>
        : <p className={styles.description}>
          Usted se encuentra en la pagina de detalles del datalogger seleccionado.<br/><br/>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
      <Breadcrumb 
        ubicacion={selectedChannel?.business.name}
        datalogger={selectedChannel?.datalogger.name}
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
              alarms={seletedChannelAlarms.filter(alarm => alarm.is_active == '1')} 
              datalogger={selectedChannel?.datalogger}
              totalTime={channelUsage?.totalData.total_time_on_hours}
              firstDate={channelUsage?.totalData.first_date}
              lastDate={channelUsage?.lastData.last_record_date}
              totalAverageTime={channelUsage?.totalData.average_usage_percentage}
            />
          </CardImage>
      </div>

      <div className={styles.chartContainer}>

      <ViewChart 
        businessUuid = {businessUuid}
        channelUuid = {channelId}
        title={`Datos del canal '${selectedChannel?.name}'`}
        subtitle={`Cada punto del gráfico integra los valores de las lecturas de los últimos ${selectedChannel?.averaging_period } minutos.`}
        average_period={selectedChannel?.averaging_period}
        availablePresets={[
          RANGE_KEYS.LAST_HOUR,
          RANGE_KEYS.LAST_12H,
          RANGE_KEYS.LAST_24H,
          RANGE_KEYS.LAST_WEEK,
          RANGE_KEYS.LAST_MONTH,
          RANGE_KEYS.LAST_6_MONTHS,
          RANGE_KEYS.LAST_YEAR
        ]}
        onRangeChange={null} //(range) => fetchCpuData(range.start, range.end)}
        alarmLogs={currentAlarmsLogs}
        alarmLogsComunicationFailure={alarmLogsComunicationFailure}
      />
      </div>
       


      <Title2 text="Alarmas Configuradas" type="alarmas"/>

      {selectedChannel?.datalogger &&
        <ChannelAlarms 
        businessUuid={businessUuid}
        alarms={seletedChannelAlarms}
        channelId={channelId}
        channelName={selectedChannel?.name}
        dataloggerId={dataloggerId}
        onAlarmClick={handleAlarmClick}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />}
      
    </>
    );
   
  
};

export default ViewChannel;
