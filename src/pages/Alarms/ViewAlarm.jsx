import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import Table from '../../components/Table/Table';
import styles from './ViewAlarm.module.css';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ModalViewAlarmLog from '../../components/ModalViewAlarmLog/ModalViewAlarmLog';
import Gauge from '../../components/Gauge/Gauge';
import ViewChart from '../../components/ViewChart/ViewChart';
import { RANGE_KEYS } from '../../components/ViewChart/constants/chartRanges';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useAlarmLogsStore } from '../../store/alarmLogsStore';
import { useDataStore } from '../../store/dataStore';

const ViewAlarm = () => {
  const { businessUuid, dataloggerId, channelId, alarmId, userId,  } = useParams();
  const location = useLocation();
  const [modalArchiveOpen, setModalArchiveOpen] = useState(false);
  const [modalLogOpen, setModalLogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);


  const {
    selectedAlarm,
    fetchAlarmById, 
    loadingStates: {fetchAlarm : isLoadingAlarm},
    error: errorLoadingAlarm
  } = useAlarmsStore();

  const {
    alarmLogs,
    fetchAlarmLogsByAlarmId,
    loadingStates: { fetchAlarmLogs: isLoadingAlarmLogs },
    error
  } = useAlarmLogsStore();

  const { channelUsage,
          fetchChannelUsage,
          loadingStates: { fetchChannelUsage: isLoadingChannelUsage },
    error: errorChannelUsage, 
  } = useDataStore();

useEffect(() => {
  //console.log(businessUuid);
  const loadData = async () => {
    if (businessUuid && alarmId) {      
      const alarmData = await fetchAlarmById(businessUuid, alarmId);
      if (alarmData){
        await fetchChannelUsage(businessUuid, alarmData.datalogger_uuid, alarmData.channel_uuid);
      };
      await fetchAlarmLogsByAlarmId(businessUuid, alarmId);
    }}
  loadData();
}, [businessUuid, alarmId, modalLogOpen]);

if (isLoadingAlarm && isLoadingAlarmLogs && isLoadingChannelUsage) {
  return <LoadingSpinner message="Cargando datos..." />;
}

  //console.log('selectedAlarm', selectedAlarm);
  //console.log('channelUsage', channelUsage);
  console.log('alarmLogs', alarmLogs);
  
  
 
  const handleOpenLogModal = (log) => {
    setSelectedLog(log);
    setModalLogOpen(true);
  };

  const handleCloseLogModal = () => {
    setModalLogOpen(false);
    setSelectedLog(null);
  };

  const alarmButtons = (
    selectedAlarm?.is_active == '1' ?
    (<>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`${location.pathname}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        onClick={() => setModalArchiveOpen(true)}
      />
    </>) :
    (<>
      <BtnCallToAction
        text="Desarchivar"
        icon="save-regular.svg"
        onClick={() => setModalArchiveOpen(true)}
      />      
    </>)
  );

  const columns = [
    { label: 'DIA Y HORA DEL EVENTO', accessor: 'fecha', icon: '/icons/clock-regular.svg' },
    { label: 'EVENTO', accessor: 'evento', icon: '/icons/flag-regular.svg' },
    { label: 'MENSAJE', accessor: 'mensaje', icon: '/icons/envelope-regular.svg' },
    { label: 'USUARIOS NOTIFICADOS', accessor: 'usuarios', icon: '/icons/user-regular.svg' }
  ];

  

  
  const preparedLogs = alarmLogs.length > 0 ? alarmLogs.map(al => {
    return {
      ...al,
      fecha: new Date(al.triggered_at).toLocaleString(),
      evento: (al.triggered == 1) ? 'Disparada' : 'Reseteada',
      mensaje: al.message,
      usuarios: al.notified_users.map(u => `${u.first_name} ${u.last_name}`).join(', ')
    };
  }) : [];



  return (
    <>
      <ModalSetArchive
        isOpen={modalArchiveOpen}
        onRequestClose={() => setModalArchiveOpen(false)}            
        entidad="alarma"
        entidadId={selectedAlarm?.uuid}
        nuevoEstado={selectedAlarm?.is_active == '1' ? '0' : '1'}
        // redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/`}
        redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/${selectedAlarm?.uuid}`}
        nombre={`${selectedAlarm?.name}`}
      />
      {selectedLog && (
        <ModalViewAlarmLog
          isOpen={modalLogOpen}
          onRequestClose={handleCloseLogModal}
          evento={selectedLog}
          solutions={selectedLog?.solutions}
          businessUuid={businessUuid}          
        />
      )}

      <Title1
        type="alarmas"
        text={`Alarma: ${selectedAlarm?.name}`}
      />
      <Breadcrumb
        // usuario={`${selectedUser?.nombre_1} ${selectedUser?.apellido_1}`}
        ubicacion={channelUsage?.business.name}
        datalogger={channelUsage?.datalogger.name}
        canal={channelUsage?.name}
        alarma={selectedAlarm?.name}
      />
      <CardImage
        image="/images/default_channel.png"
        title={selectedAlarm?.name}
        buttons={alarmButtons}
      >
        
        <div className={styles.alarmInfo}>
          {selectedAlarm?.is_active == '0' && (
            <CustomTag text="Archivada" type="archive" icon="/icons/archive-solid.svg" />
          )}
          <p><strong>Condición:</strong> {selectedAlarm?.condition_show}</p><br/>
          <p><strong>Tipo de Alarma:</strong> {selectedAlarm?.alarm_type}</p><br/>
          <p><strong>Descripción:</strong> {selectedAlarm?.description}</p><br/>
          <p><strong>Integra los valores de los ultimos:</strong> {selectedAlarm?.time_range} minutos.</p><br/>
          <p><strong>Ultimo registro:</strong> {channelUsage?.lastData.last_record_date} </p>
          
          
          <div className={styles.gaugePlaceholder}>              
                {selectedAlarm?.alarm_type == "porcentage_on" && (() => {                 
                  return (
                    <Gauge 
                      currentValue={channelUsage?.lastData.porcentageUsagePeriod}
                      alarmMin={0}
                      alarmMax={selectedAlarm?.var01}                              
                    />
                  );
                })()}
              </div>         

          <p><strong>Fecha de creación:</strong> {new Date(selectedAlarm?.created_at).toLocaleDateString()}</p>
        </div>

       {/* */}
      </CardImage>      

      <div className={styles.chartContainer}>
        <ViewChart 
          businessUuid = {businessUuid}
          channelUuid = {channelId}
          title={`Datos del canal '${channelUsage?.name}'`}
          subtitle={`Cada punto del gráfico integra los valores de las lecturas de los últimos ${channelUsage?.averaging_period } minutos.`}
          average_period={channelUsage?.averaging_period}
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
        />
      </div>

      <Title2 type="historial" text={`Historial de disparos para alarma ${selectedAlarm?.name}`} />
      
      {isLoadingAlarm ? (
        <LoadingSpinner message="Cargando historial de alarmas..." />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : alarmLogs.length === 0 ? (
        <div className={styles.noData}>No hay registros de disparos para esta alarma</div>
      ) : (
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={preparedLogs}
            onRowClick={(row) => handleOpenLogModal(row)}
          />
        </div>
      )}
    </>
  );
};

export default ViewAlarm;
