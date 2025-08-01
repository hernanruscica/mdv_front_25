import React, { useMemo } from 'react';
import Table from '../Table/Table';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import styles from './ChannelAlarms.module.css';

const ChannelAlarms = ({ alarms, channelId, dataloggerId, onAlarmClick, showAddButton = false }) => {
  const columns = useMemo(() => [
    { 
      label: 'NOMBRE ALARMA', 
      accessor: 'nombreAlarma',
      icon: '/icons/bell-regular.svg'
    },    
    { 
      label: 'CONDICION', 
      accessor: 'condicion_mostrar',
      icon: '/icons/building-regular.svg'
    },   
    { 
      label: 'ESTADO', 
      accessor: 'estado',
      icon: '/icons/eye-regular.svg' 
    }
  ], []);

  const preparedAlarms = useMemo(() => 
    alarms.map(alarm => ({
      nombreAlarma: alarm.nombre,
      canal: alarm?.canal_nombre || 'Sin canal',
      tipo: alarm.tipo_alarma,  
      condicion_mostrar: `${alarm.condicion_mostrar} ${alarm.variable01}` || 'Sin condición',
      estado: alarm.estado,
      url: `/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/${alarm.id}`,  
      id: alarm.id
    })), 
    [alarms, dataloggerId, channelId]
  );

  //console.log(preparedAlarms);
  return (
    <div className={styles.alarmsContainer}>
      {showAddButton && (
        <BtnCallToAction
          text="Agregar alarma"
          icon="plus-circle-solid.svg"
          type="normal"
          url={`/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/agregar`}
        />
      )}

      {preparedAlarms && preparedAlarms.length > 0 ? (
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedAlarms}
            onRowClick={onAlarmClick}
            showAddButton={showAddButton}
          />
        </div>
      ) : (
        <p className={styles.noAlarms}>No hay alarmas configuradas para este canal.</p>
      )}
    </div>
  );
};

export default ChannelAlarms; 