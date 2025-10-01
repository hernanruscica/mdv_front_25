import React, { useMemo } from 'react';
import Table from '../Table/Table';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import styles from './ChannelAlarms.module.css';

const ChannelAlarms = ({ alarms, channelId, channelName = 'sin identificar', dataloggerId, onAlarmClick, showAddButton = false }) => {
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
      nombreAlarma: alarm.name,
      canal: channelName ,
      tipo: alarm.type,  
      condicion_mostrar: `${alarm.condition_show} ` || 'Sin condición',
      estado: alarm.is_active,
      url: `/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/${alarm.uuid}`,  
      id: alarm.uuid
    })), 
    [alarms, dataloggerId, channelId]
  );

  //console.log(preparedAlarms);
  return (

    <div className={styles.alarmsContainer}>      

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