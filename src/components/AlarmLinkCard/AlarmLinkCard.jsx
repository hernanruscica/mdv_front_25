import { Link } from 'react-router-dom';
import styles from './AlarmLinkCard.module.css';

import GaugeLinear from'../GaugeLinear/GaugeLinear';
const AlarmLinkCard = ({ to, alarm, currentValue, currentMin, currentMax, isTriggered }) => {
  
  // Construcción de la URL
  const linkUrl = `/panel/ubicaciones/${alarm.business_uuid}/dataloggers/${alarm.datalogger_uuid}/canales/${alarm.channel_uuid}/alarmas/${alarm.uuid}`;

  // Si no pasas 'isTriggered' explícitamente, intenta leerlo del objeto alarma
  const triggeredState = isTriggered !== undefined ? isTriggered : alarm.triggered;

  return (
    <Link 
      to={to || linkUrl}
      title={`Ver detalles de ${alarm.name}`}
      className={`${styles.cardLink} ${triggeredState ? styles.triggered : styles.normal}`}
    >
      
      {/* Encabezado */}
      <div>
        <h3 className={styles.title}>{alarm.name}</h3>
        <p className={styles.condition}>
           Condición: <strong>{alarm.condition_show}</strong>
        </p>
      </div>

      {/* Visualización */}
      <div className={styles.gaugeWrapper}>
         <GaugeLinear 
            currentValue={currentValue} 
            alarmMin={currentMin} 
            alarmMax={currentMax} 
         /> 
         
      </div>

    </Link>
  );
};

export default AlarmLinkCard;