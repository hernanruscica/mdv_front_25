import { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';

import AlarmMonitorCard from '../../components/AlarmMonitorCard/AlarmMonitorCard';
import Table from '../../components/Table/Table';
import styles from './ViewAlarm.module.css';

import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ModalViewAlarmLog from '../../components/ModalViewAlarmLog/ModalViewAlarmLog';
import ViewChart from '../../components/ViewChart/ViewChart';
import { RANGE_KEYS } from '../../components/ViewChart/constants/chartRanges';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useAlarmLogsStore } from '../../store/alarmLogsStore';
import { useDataStore } from '../../store/dataStore';
import { useAuthStore } from '../../store/authStore'
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

// NUEVOS IMPORTS
import { ALARM_DETAILS_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';



const ViewAlarm = () => {
  const { businessUuid, dataloggerId, channelId, alarmId, userId,  } = useParams();
  const location = useLocation();
  const [modalArchiveOpen, setModalArchiveOpen] = useState(false);
  const [modalLogOpen, setModalLogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [currentAlarmsLogs, setCurrentAlarmsLogs] = useState([]);
  const [alarmLogsComunicationFailure, setAlarmLogsComunicationFailure] = useState([]);


  const {
    selectedAlarm,
    fetchAlarmById, 
    loadingStates: {fetchAlarm : isLoadingAlarm},
    error: errorLoadingAlarm
  } = useAlarmsStore();

  const {
    alarmLogs,
    fetchAlarmLogsByAlarmId,
    fetchAlarmLogsByDataloggerId,
    loadingStates: { fetchAlarmLogs: isLoadingAlarmLogs, fetchAlarmLogsByDataloggerId: isLoadingAlarmLogsByDataloggerId  },
    error
  } = useAlarmLogsStore();

  const { channelUsage,
          fetchChannelUsage,
          dataloggerUsage,
          fetchDataloggerUsage,
          loadingStates: { fetchChannelUsage: isLoadingChannelUsage, fetchDataloggerUsage: isLoadingDataloggerUsage },
    error: errorChannelUsage, 
  } = useDataStore();

  const { user } = useAuthStore();

  // ACTUALIZACIÓN: Lógica de rol y acordeón
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);
  const infoData = userCurrentRole?.name === 'Owner' ? ALARM_DETAILS_INFO.Owner : ALARM_DETAILS_INFO.General;

// 1) Cargar solo la alarma cuando cambian ids
useEffect(() => {
  if (!businessUuid || !alarmId) return;
  fetchAlarmById(businessUuid, alarmId);
}, [businessUuid, alarmId, dataloggerId, channelId]);

// 2) Cuando la alarma ya está, cargar lo demás en paralelo
useEffect(() => {
  if (!businessUuid || !selectedAlarm) return;

  const load = async () => {
    const promises =  [];

    if (selectedAlarm.alarm_type === 'porcentage_on') {
      promises.push(
        fetchChannelUsage(businessUuid, selectedAlarm.datalogger_uuid, selectedAlarm.channel_uuid)
      );
    } else if (selectedAlarm.alarm_type === 'comunication_failure') {
      promises.push(fetchDataloggerUsage(businessUuid, selectedAlarm.datalogger_uuid));
    }

    promises.push(
      (async () => {
        const logs = await fetchAlarmLogsByAlarmId(businessUuid, selectedAlarm.uuid);
        setCurrentAlarmsLogs([{ uuid: selectedAlarm.uuid, logs }]);
      })()
    );

    promises.push(
      (async () => {
        const byDatalogger = await fetchAlarmLogsByDataloggerId(
          businessUuid,
          selectedAlarm.datalogger_uuid
        );
        setAlarmLogsComunicationFailure(
          byDatalogger?.filter(log => log.alarm_type === 'comunication_failure')
        );
      })()
    );

    await Promise.all(promises);
  };

  load();
}, [businessUuid, selectedAlarm]);


if (isLoadingAlarm && isLoadingAlarmLogs && isLoadingChannelUsage || isLoadingAlarmLogsByDataloggerId || isLoadingDataloggerUsage) {
  return <LoadingSpinner message="Cargando datos..." />;
}

  //console.log('selectedAlarm', selectedAlarm);
  //console.log('channelUsage', channelUsage);
  //console.log('dataloggerUsage', dataloggerUsage)
  //console.log('alarmLogs', alarmLogs);
  //console.log('currentAlarmLoigs', currentAlarmsLogs);

  
  
 
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
      fecha: FormatearFechaCompleta(al.triggered_at),
      evento: (al.triggered == 1) ? 'Disparada' : 'Reseteada',
      mensaje: al.message,
      usuarios: al.notified_users.map(u => `${u.first_name} ${u.last_name}`).join(', ')
    };
  }) : [];

//console.log('alarmLogs', alarmLogs[0]);
//console.log('harcodeada formateada 2026-01-20T15:40:01.000Z', FormatearFechaCompleta('2026-01-20T15:40:01.000Z'));
//console.log('selectedAlarm', selectedAlarm);



  return (
    <>
      <ModalSetArchive
        isOpen={modalArchiveOpen}
        onRequestClose={() => setModalArchiveOpen(false)}            
        entidad="alarma"
        entidadId={selectedAlarm?.uuid}
        nuevoEstado={selectedAlarm?.is_active == '1' ? '0' : '1'}
        // redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/`}
        redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/`}
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

      {/* REEMPLAZO: Acordeón centralizado */}
      <InfoAccordion data={infoData} />

      <Breadcrumb
        // usuario={`${selectedUser?.nombre_1} ${selectedUser?.apellido_1}`}
        ubicacion={selectedAlarm?.business.name}
        datalogger={channelUsage?.datalogger.name || dataloggerUsage?.name}
        canal={channelUsage?.name}
        alarma={selectedAlarm?.name}
      />   

    <AlarmMonitorCard
        alarm={selectedAlarm}
        usageData={channelUsage}
        buttons={alarmButtons}
        formatDate={FormatearFechaCompleta} // Pasamos tu función de fecha
    />

      <div className={styles.chartContainer}>
        <ViewChart 
          businessUuid = {businessUuid}
          channelUuid = {channelId || selectedAlarm?.channel_uuid}
          title={selectedAlarm?.alarm_type == 'porcentage_on' 
                  ? `Datos del canal '${channelUsage?.name}'` 
                  : `Fallos de transmision de datos del datalogger '${dataloggerUsage?.name}'`}
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
          alarmLogs={currentAlarmsLogs}
          alarmLogsComunicationFailure={alarmLogsComunicationFailure}
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
