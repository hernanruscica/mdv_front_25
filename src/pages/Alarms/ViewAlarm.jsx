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
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import Gauge from '../../components/Gauge/Gauge';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useAlarmLogsStore } from '../../store/alarmLogsStore';

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

useEffect(() => {
  console.log(businessUuid);
  const loadData = async () => {
    if (businessUuid && alarmId) {
      
      await fetchAlarmById(businessUuid, alarmId);
      await fetchAlarmLogsByAlarmId(businessUuid, alarmId);
    }}
  loadData();
}, [businessUuid, alarmId]);

if (isLoadingAlarm && isLoadingAlarmLogs) {
  return <LoadingSpinner message="Cargando datos..." />;
}

  console.log('selectedAlarm', selectedAlarm);
 
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

  const eventosMap = new Map();

  alarmLogs.forEach(log => {
    if (!eventosMap.has(log.id)) {
      eventosMap.set(log.id, {
        fecha: new Date(log.fecha_disparo).toLocaleString(),
        fecha_vista: new Date(log.fecha_vista).toLocaleString(),
        evento: log.disparada == 0 ? 'Reset' : 'Disparo',
        id: log.id,
        mensaje: log.mensaje,
        usuarios: 1,
        usuarios_afectados: [{
          nombre: log.nombre_1,
          apellido: log.apellido_1,
          email: log.email
        }]
      });
    } else {
      const evento = eventosMap.get(log.id);
      evento.usuarios += 1;
      evento.usuarios_afectados.push({
        nombre: log.nombre_1,
        apellido: log.apellido_1,
        email: log.email,
        vista: (log.fecha_vista == '2024-01-01T03:00:00.000Z') ? false : true,
      });
    }
  });

  const preparedLogs = Array.from(eventosMap.values());



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
        />
      )}

      <Title1
        type="alarmas"
        text={`Alarma: ${selectedAlarm?.name}`}
      />
      <Breadcrumb
        // usuario={`${selectedUser?.nombre_1} ${selectedUser?.apellido_1}`}
        ubicacion={'currentLocation?.name'}
        datalogger={'datalogger?.name'}
        canal={'currentChannel?.name' }
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
          <p><strong>Condición:</strong> {selectedAlarm.condition_show}</p>
          <p><strong>Tipo de Alarma:</strong> {selectedAlarm.alarm_type}</p>
          <p><strong>Descripción:</strong> {selectedAlarm.description}</p>
          <div className={styles.gaugePlaceholder}>              
                {selectedAlarm?.alarm_type == "PORCENTAJE_ENCENDIDO" && (() => {
                  const conditionOperator = selectedAlarm.condition_logic.split(" ")[1];
                  const conditionValue = selectedAlarm.var01;  
                  const max = (conditionOperator.includes(">")) ? conditionValue : 100;
                  const min = (conditionOperator.includes("<")) ? conditionValue : 0;
                  const preparedData = prepareDigitalData(primaryChannelData);
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

          <p><strong>Canales monitoreados:</strong> <br/>
            <CardBtnSmall 
              title={currentChannel?.name || 'Canal principal'} 
              url={`/panel/ubicaciones/${businessUuid}/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.uuid}`} 
            />
            {selectedAlarm.alarm_type === 'FUNCIONAMIENTO_SIMULTANEO' && secondaryChannel && (
              <CardBtnSmall 
                title={secondaryChannel?.name || 'Canal secundario'} 
                url={`/panel/dataloggers/${currentDatalogger?.uuid}/canales/${secondaryChannel.uuid}`} 
              />
            )}
          </p>

          <p><strong>Fecha de creación:</strong> {new Date(selectedAlarm?.created_at).toLocaleDateString()}</p>
        </div>
      </CardImage>      

      <Title2 type="historial" text={`Historial de disparos para alarma ${selectedAlarm.name}`} />
      
      {isLoading ? (
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
