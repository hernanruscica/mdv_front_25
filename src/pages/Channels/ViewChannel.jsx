import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
// import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
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
import { useMaintenanceLogsStore } from '../../store/maintenanceLogsStore';
import ViewChart from '../../components/ViewChart/ViewChart';
import { RANGE_KEYS } from '../../components/ViewChart/constants/chartRanges';
import ChannelMaintenanceLogs from '../../components/ChannelMaintenanceLogs/ChannelMaintenanceLogs';
import ModalViewMaintenanceLog from '../../components/ModalViewMaintenanceLog/ModalViewMaintenanceLog';

// NUEVOS IMPORTS
import { CHANNEL_VIEW_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const ViewChannel = () => {
  const { businessUuid, dataloggerId, channelId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [modalOpen, setModalOpen] = useState(false);  
  const [currentAlarmsLogs, setCurrentAlarmsLogs] = useState([]);
  const [alarmLogsComunicationFailure, setAlarmLogsComunicationFailure] = useState([]);
  const [maintenanceLogModalOpen, setMaintenanceLogModalOpen] = useState(false);
  const [selectedMaintenanceLog, setSelectedMaintenanceLog] = useState(null);
  const maintenanceRef = useRef(null);

  const scrollToMaintenance = () => {
    maintenanceRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const { fetchChannelById, 
          selectedChannel, 
          loadingStates: { fetchChannel: isLoadingChannel, updateChannel: isUpdatingChannel },
          error: errorChannel
        } = useChannelsStore();

  const { alarms,
          fetchAlarmsByChannel,
          loadingStates : { fetchAlarmsByChannel : isLoadingAlarmsByChannel },
          error : errorLoadindAlarms
        } = useAlarmsStore();
  
  const { fetchChannelUsage, channelUsage,
          loadingStates: { fetchChannelUsage: isLoadingChannelUsage }
        } = useDataStore();
  
  const { fetchAlarmLogsByAlarmId, fetchAlarmLogsByDataloggerId,
          loadingStates: { fetchAlarmLogs: isLoadingAlarmLogs, fetchAlarmLogsByDataloggerId: isLoadingAlarmLogsByDataloggerId }
        } = useAlarmLogsStore();

  const { maintenanceLogs, fetchMaintenanceLogs,
          loadingStates: { fetchMaintenanceLogs: isLoadingMaintenanceLogs }
        } = useMaintenanceLogsStore();

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);

  // Determinamos la información para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? CHANNEL_VIEW_INFO.Owner 
    : CHANNEL_VIEW_INFO.General;

  useEffect(() => {
    const loadData = async () => {
      if (businessUuid && channelId) {
        try {
          const currentChannel = await fetchChannelById(channelId, businessUuid);
          const currentAlarms = await fetchAlarmsByChannel(businessUuid, channelId);
          
          await fetchChannelUsage(businessUuid, currentChannel?.datalogger.uuid, channelId);

          const alarmLogsByDatalogger = await fetchAlarmLogsByDataloggerId(businessUuid, currentChannel?.datalogger.uuid);
          setAlarmLogsComunicationFailure(alarmLogsByDatalogger?.filter(log => log.alarm_type === "comunication_failure"));

          const promises = currentAlarms.map(async (alarm) => {
            const logs = await fetchAlarmLogsByAlarmId(businessUuid, alarm.uuid);
            return { uuid: alarm.uuid, logs: logs };
          });

          const alarmsWithLogs = await Promise.all(promises);
          setCurrentAlarmsLogs(alarmsWithLogs);

          await fetchMaintenanceLogs(businessUuid, currentChannel?.datalogger.uuid, channelId);

        } catch (error) {
          console.error("Error cargando datos:", error);
        }
      }
    };
    loadData();
  }, [businessUuid, channelId]);

  if (isLoadingChannel || isUpdatingChannel || isLoadingAlarmsByChannel      
      || isLoadingChannelUsage || isLoadingAlarmLogs || isLoadingAlarmLogsByDataloggerId
      || isLoadingMaintenanceLogs) {
    return <LoadingSpinner message="Cargando datos..." />;
  }
    
  if (errorChannel || errorLoadindAlarms) {
    return <div className={styles.error}>Error Cargando los datos</div>;
  }

  const handleAlarmClick = (row) => {
    navigate(`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger.uuid}/canales/${selectedChannel?.uuid}/alarmas/${row.id}`);
  }; 

  const handleViewMaintenanceLog = (log) => {
    setSelectedMaintenanceLog(log);
    setMaintenanceLogModalOpen(true);
  }; 

  const seletedChannelAlarms = alarms.filter(al => al.channel_uuid === selectedChannel?.uuid);
      
  const canGenerateReport = userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator';

  const channelButtons = (selectedChannel?.is_active == '1') ? (
    <>
      {canGenerateReport && (
        <BtnCallToAction
          text="Generar Informe"
          icon="chart-line-solid.svg"
          type="normal"
          url={`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}/informe`}
        />
      )}
      <BtnCallToAction
        text="Ver Mantenimiento"
        icon="person-digging-solid.svg"
        type="normal"
        onClick={scrollToMaintenance}
      />
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
      {canGenerateReport && (
        <BtnCallToAction
          text="Generar Informe"
          icon="chart-line-solid.svg"
          type="normal"
          url={`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}/informe`}
        />
      )}
      <BtnCallToAction
        text="Ver Mantenimiento"
        icon="person-digging-solid.svg"
        type="normal"
        onClick={scrollToMaintenance}
      />
      <BtnCallToAction
        text="Desarchivar"
        icon="archive-solid.svg"
        type="normal"
        onClick={() => setModalOpen(true)}
      />
    </>
  );

  //onsole.log("maintenanceLogs:", maintenanceLogs);
  //console.log("currentChannel?.datalogger.uuid", selectedChannel?.datalogger.uuid);
  
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

      
      <InfoAccordion data={infoData} />
      
      <BreadcrumbAuto />
      
      <div className={styles.cardsContainer}>
          <CardImage
            image={`${selectedChannel?.img}`}
            title={selectedChannel?.name}
            buttons={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator' ? channelButtons : ''}
          >
            {selectedChannel?.is_active == '0' && (
              <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
            )}
            <ChannelInfo 
              channel={selectedChannel} 
              alarms={seletedChannelAlarms.filter(alarm => alarm.is_active == '1')} 
              datalogger={selectedChannel?.datalogger}
              totalTime={channelUsage?.totalData?.total_time_on_hours}
              firstDate={channelUsage?.totalData?.first_date}
              lastDate={channelUsage?.lastData?.last_record_date}
              totalAverageTime={channelUsage?.totalData?.average_usage_percentage}
            />
          </CardImage>
      </div>

      <div className={styles.chartContainer}>
        <ViewChart 
          businessUuid = {businessUuid}
          channelUuid = {channelId}
          dataloggerUuid={selectedChannel?.datalogger?.uuid}
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
          alarmLogs={currentAlarmsLogs}
          alarmLogsComunicationFailure={alarmLogsComunicationFailure}
        />
      </div>

      <Title2 text="Alarmas Configuradas" type="alarmas"/>

      {selectedChannel?.datalogger && (
        <ChannelAlarms 
          businessUuid={businessUuid}
          alarms={seletedChannelAlarms}
          channelId={channelId}
          channelName={selectedChannel?.name}
          dataloggerId={dataloggerId}
          onAlarmClick={handleAlarmClick}
          showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
        />
      )}

      <div ref={maintenanceRef}>
        <Title2 text="Mantenimiento" type="mantenimiento"/>

        <ChannelMaintenanceLogs
          businessUuid={businessUuid}
          dataloggerUuid={selectedChannel?.datalogger.uuid}
          channelUuid={channelId}
          totalTime={channelUsage?.totalData?.total_time_on_hours}
          maintenanceLogs={maintenanceLogs}
          onViewLog={handleViewMaintenanceLog}
          showAddButton= {userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
          onCreateSuccess={() => {
            fetchMaintenanceLogs(businessUuid, selectedChannel?.datalogger.uuid, channelId);
          }}
        />
      </div>

      <ModalViewMaintenanceLog
        isOpen={maintenanceLogModalOpen}
        onRequestClose={() => {
          setMaintenanceLogModalOpen(false);
          setSelectedMaintenanceLog(null);
        }}
        log={selectedMaintenanceLog}
        businessUuid={businessUuid}
        dataloggerUuid={selectedChannel?.datalogger.uuid}
        channelUuid={channelId}
        onUpdateSuccess={() => {
          fetchMaintenanceLogs(businessUuid, selectedChannel?.datalogger.uuid, channelId);
        }}
      />
    </>
  );
};

export default ViewChannel;