import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useAlarmLogsStore } from '../../store/alarmLogsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import Table from '../../components/Table/Table';
import styles from './ViewAlarm.module.css';
import { valueOrDefault } from 'chart.js/helpers';

const ViewAlarm = () => {
  const { alarmId } = useParams();
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const { 
    fetchAlarmById,
    loadingStates: { fetchAlarm: isLoading },
    error 
  } = useAlarmsStore();

  const [alarmLogs, setAlarmLogs] = useState([]);
  const { 
    fetchAlarmLogsByAlarmId,
    loadingStates: { fetchAlarmLogs: isLoadingLogs },
    error: errorLogs 
  } = useAlarmLogsStore();

  useEffect(() => {
    const loadAlarm = async () => {
      const alarm = await fetchAlarmById(alarmId);
      setCurrentAlarm(alarm);
    };

    if (alarmId) {
      loadAlarm();
    }
  }, [alarmId]);

  useEffect(() => {
    const loadAlarmLogs = async () => {
      if (currentAlarm) {
        const logs = await fetchAlarmLogsByAlarmId(currentAlarm.id);
        setAlarmLogs(logs || []);
      }
    };
    
    loadAlarmLogs();
  }, [currentAlarm]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando detalles de la alarma..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!currentAlarm) {
    return <div className={styles.error}>Alarma no encontrada</div>;
  }

  const alarmButtons = (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/dataloggers/${currentAlarm?.datalogger_id}/canales/${currentAlarm?.canal_id}/alarmas/${currentAlarm?.alarma_id}/edicion`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        url={`/panel/dataloggers/${currentAlarm?.datalogger_id}/canales/${currentAlarm?.canal_id}/alarmas/${currentAlarm?.alarma_id}/eliminar`}
      />
    </>
  );

  const columns = [
    { label: 'DIA Y HORA DEL EVENTO', accessor: 'fecha' },
    { label: 'USUARIO', accessor: 'usuario' },
    { label: 'EVENTO', accessor: 'evento' },
    { label: 'VALOR', accessor: 'valor' },
    { label: 'VISTA', accessor: 'vista' }
  ];

  const preparedLogs = alarmLogs.map(log => ({
    fecha: new Date(log.fecha_disparo).toLocaleString(),
    usuario: `${log.nombre_1} ${log.apellido_1}`, 
    vista: (log.fecha_vista === "2024-01-01T00:00:00.000Z") ? 'No vista' : 'vista',
    evento: (log.disparada == 0) ? 'Reset' : 'Disparo',
    valor: log.variables_valores,
    mensaje: log.mensaje
  }));

  console.log(currentAlarm, alarmLogs)

  return (
    <>
      <Title1 
        type="alarmas"
        text={`Alarma: ${currentAlarm.nombre}`}
      />
      <Breadcrumb />
      <CardImage
        image="/images/default_channel.png"
        title={currentAlarm.nombre}
        buttons={alarmButtons}
      >
        <div className={styles.alarmInfo}>
          <p><strong>Nombre:</strong> {currentAlarm.nombre}</p>
          <p><strong>Condición:</strong> {currentAlarm.condicion}</p>
          <p><strong>Estado:</strong> {currentAlarm.estado ? 'Activa' : 'Inactiva'}</p>
          <p><strong>Tipo de Alarma:</strong> {currentAlarm.tipo_alarma}</p>
          <p><strong>Descripción:</strong> {currentAlarm.descripcion}</p>
          <p><strong>Fecha de creación:</strong> {new Date(currentAlarm.fecha_creacion).toLocaleDateString()}</p>
        </div>
      </CardImage>
      <Title2 type="historial" text={`Historial de disparos para alarma ${currentAlarm.nombre}`} />
      
      {isLoadingLogs ? (
        <LoadingSpinner message="Cargando historial de alarmas..." />
      ) : errorLogs ? (
        <div className={styles.error}>{errorLogs}</div>
      ) : (
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedLogs}
          />
        </div>
      )}
    </>
  );
}; 

export default ViewAlarm;