import { useState, useMemo } from 'react';
import Table from '../Table/Table';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import ModalCreateMaintenanceLog from '../ModalCreateMaintenanceLog/ModalCreateMaintenanceLog';
import styles from './ChannelMaintenanceLogs.module.css';

const PRIORITY_MAP = {
  high: { label: 'Alta', type: 'danger' },
  medium: { label: 'Media', type: 'warning' },
  low: { label: 'Baja', type: 'success' }
};

const STATUS_MAP = {
  pending: 'Pendiente',
  in_progress: 'En Progreso',
  completed: 'Completado'
};

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

const formatNotificacionEnviada = (dateString) => {
  if (!dateString || dateString === null) {
    return 'No enviada todavía';
  }
  const date = new Date(dateString);
  return `enviada el ${date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })}`;
};

const ChannelMaintenanceLogs = ({ 
  businessUuid, 
  dataloggerUuid, 
  channelUuid, 
  totalTime = 0,
  maintenanceLogs, 
  onViewLog,
  showAddButton = false,
  onOpenCreateLog,
  onCreateSuccess
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createLogType, setCreateLogType] = useState('task');

  const taskColumns = useMemo(() => [
    { label: 'TITULO', accessor: 'title' },
    { label: 'FECHA', accessor: 'fechaFormateada' },
    { label: 'HS DE USO', accessor: 'time_usage' },
    { label: 'ESTADO', accessor: 'estadoTag' },
    { label: 'NOTIFICACIÓN', accessor: 'notificacionEnviada' }
  ], []);

  const observationColumns = useMemo(() => [
    { label: 'TITULO', accessor: 'title' },
    { label: 'FECHA', accessor: 'fechaFormateada' },
    { label: 'PRIORIDAD', accessor: 'prioridadTag' }
  ], []);

  const preparedTasks = useMemo(() => {
    if (!maintenanceLogs || !Array.isArray(maintenanceLogs)) return [];
    return maintenanceLogs
      .filter(log => log.type === 'task')
      .map(log => ({
        ...log,
        fechaFormateada: formatDate(log.scheduled_date),
        estadoTag: STATUS_MAP[log.status] || log.status,
        notificacionEnviada: formatNotificacionEnviada(log.last_notification_sent_at),
        onClick: () => onViewLog(log)
      }));
  }, [maintenanceLogs, onViewLog]);

  const preparedObservations = useMemo(() => {
    if (!maintenanceLogs || !Array.isArray(maintenanceLogs)) return [];
    return maintenanceLogs
      .filter(log => log.type === 'observation')
      .map(log => {
        const priorityInfo = PRIORITY_MAP[log.priority] || { label: log.priority, type: 'normal' };
        return {
          ...log,
          fechaFormateada: formatDate(log.created_at),
          prioridadTag: priorityInfo.label,
          prioridadType: priorityInfo.type,
          onClick: () => onViewLog(log)
        };
      });
  }, [maintenanceLogs, onViewLog]);

  const handleViewLog = (log) => {
    if (onViewLog) {
      onViewLog(log);
    }
  };

  const handleOpenCreateTask = () => {
    if (onOpenCreateLog) {
      onOpenCreateLog('task');
    } else {
      setCreateLogType('task');
      setCreateModalOpen(true);
    }
  };

  const handleOpenCreateObservation = () => {
    if (onOpenCreateLog) {
      onOpenCreateLog('observation');
    } else {
      setCreateLogType('observation');
      setCreateModalOpen(true);
    }
  };

  const handleCreateSuccess = () => {
    if (onCreateSuccess) {
      onCreateSuccess();
    }
    setCreateModalOpen(false);
  };

  return (
    <div className={styles.container}>
      <div id="mantenimiento-section">
        <h3 className={styles.sectionTitle}>TAREAS DE MANTENIMIENTO</h3>
        
        {preparedTasks.length > 0 ? (
          <Table
            columns={taskColumns}
            data={preparedTasks}
            onRowClick={handleViewLog}
            showAddButton={false}
          />
        ) : null}
        
        <div className={styles.emptyState}>
          {showAddButton && (
            <BtnCallToAction
              text="Agregar Tarea"
              icon="plus-circle-solid.svg"
              onClick={handleOpenCreateTask}
            />
          )}
          {preparedTasks.length === 0 && (
            <p className={styles.emptyMessage}>No hay tareas de mantenimiento</p>
          )}
        </div>
      </div>

      <div className={styles.sectionDivider}></div>

      <div>
        <h3 className={styles.sectionTitle}>OBSERVACIONES SOBRE EL EQUIPO</h3>
        
        {preparedObservations.length > 0 ? (
          <Table
            columns={observationColumns}
            data={preparedObservations}
            onRowClick={handleViewLog}
            showAddButton={false}
          />
        ) : null}

        <div className={styles.emptyState}>
          {showAddButton && (
            <BtnCallToAction
              text="Agregar Observación"
              icon="plus-circle-solid.svg"
              onClick={handleOpenCreateObservation}
            />
          )}
          {preparedObservations.length === 0 && (
            <p className={styles.emptyMessage}>No hay observaciones sobre el equipo</p>
          )}
        </div>
      </div>

      <ModalCreateMaintenanceLog
        isOpen={createModalOpen}
        onRequestClose={() => setCreateModalOpen(false)}
        logType={createLogType}
        businessUuid={businessUuid}
        dataloggerUuid={dataloggerUuid}
        channelUuid={channelUuid}
        totalTime={totalTime}
        onCreateSuccess={handleCreateSuccess}
      />
    </div>
  );
};

export default ChannelMaintenanceLogs;
