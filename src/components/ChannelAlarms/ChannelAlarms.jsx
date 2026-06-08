import { useMemo } from 'react';
import Table from '../Table/Table';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import styles from './ChannelAlarms.module.css';

const ChannelAlarms = ({ 
  businessUuid, 
  alarms, 
  channelId, 
  channelName = 'sin identificar', 
  dataloggerId, 
  onAlarmClick, 
  showAddButton = false,
  isMisAlarmasRoute = false,
  onSubscribeClick = () => {}
}) => {
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
    alarms?.map(alarm => ({
      nombreAlarma: alarm.name,      
      tipo: alarm.alarm_type,  
      condicion_mostrar: `${alarm.condition_show} ` || 'Sin condición',      
      url: alarm?.alarm_type == 'porcentage_on' 
              ? `/panel/ubicaciones/${alarm?.business_uuid}/dataloggers/${alarm?.datalogger_uuid}/canales/${alarm.channel_uuid}/alarmas/${alarm.uuid || alarm.alarm_uuid}`
              : `/panel/ubicaciones/${alarm?.business_uuid}/dataloggers/${alarm?.datalogger_uuid}/alarmas/${alarm.uuid || alarm.alarm_uuid}`,  
      id: alarm.uuid,
      estado: alarm.is_active
    })), 
    [alarms, dataloggerId, channelId]
  );

  //console.log('showAddButton', showAddButton);
  //console.log('alarm example', alarms[4]);
//console.log('onsuscribClick', onSubscribeClick);

  return (

    <div className={styles.alarmsContainer}>      

      {preparedAlarms && preparedAlarms.length > 0 ? (
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedAlarms}
            onRowClick={onAlarmClick}
            showAddButton={showAddButton}
            addUrl={isMisAlarmasRoute ? null : `/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/agregar`}
            onAddClick={onSubscribeClick}
          />
        </div>
      ) : (
        <>
          <BtnCallToAction 
              text="Agregar" 
              icon="plus-circle-solid.svg"              
              onClick={onSubscribeClick}
            />                    
          <p className={styles.noAlarms}>No se encontraron alarmas activas para la entidad solicitada.</p>
        </>
      )}
    </div>
    
  );
};

export default ChannelAlarms; 