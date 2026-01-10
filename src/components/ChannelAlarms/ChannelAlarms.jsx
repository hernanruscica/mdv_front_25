import { useMemo } from 'react';
import Table from '../Table/Table';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import styles from './ChannelAlarms.module.css';

const ChannelAlarms = ({ businessUuid, alarms, channelId, channelName = 'sin identificar', dataloggerId, onAlarmClick, showAddButton = false }) => {
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
      tipo: alarm.alarm_type,  
      condicion_mostrar: `${alarm.condition_show} ` || 'Sin condición',      
      url: `/panel/ubicaciones/${businessUuid}/dataloggers/${alarm?.datalogger_uuid}/canales/${alarm.channel_uuid}/alarmas/${alarm.uuid}`,  
      id: alarm.uuid
    })), 
    [alarms, dataloggerId, channelId]
  );

  //console.log('showAddButton', showAddButton);
  console.log('alarm example', alarms[0]);
  
  return (

    <div className={styles.alarmsContainer}>      

      {preparedAlarms && preparedAlarms.length > 0 ? (
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedAlarms}
            onRowClick={onAlarmClick}
            showAddButton={showAddButton}
            addUrl={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/agregar`}
          />
        </div>
      ) : (
        <>
          <BtnCallToAction 
              text="Agregar" 
              icon="plus-circle-solid.svg" 
              url={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/agregar`}
            />
          <p className={styles.noAlarms}>No se encontraron alarmars activas para la entidad solicitada.</p>
        </>
      )}
    </div>
    
  );
};

export default ChannelAlarms; 