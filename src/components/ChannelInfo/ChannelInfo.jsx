import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import styles from './ChannelInfo.module.css';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

const ChannelInfo = ({ channel, alarms, datalogger = null, totalTime = 0, firstDate, lastDate, totalAverageTime }) => {
  console.log('Channel info lastDate', lastDate);
  
  return (
    <div className={styles.channelInfo}>
      <p>
        Pertenece al datalogger:{' '}
        <CardBtnSmall 
          title={datalogger?.name || 'default'}
          url={`/panel/ubicaciones/${channel?.business_uuid}/dataloggers/${datalogger?.uuid}`}
        />
      </p>
      <p><strong>Descripción:</strong> {channel?.description}</p>
      <hr/>
      <p>
        <strong>Tiempo de Uso:</strong>{` ${totalTime || '####'} Hs.`}<br/>
        <strong>Porcentaje de uso total</strong>{` ${totalAverageTime || '####'} %. `}<br/>
        con datos desde <strong>
          {firstDate ? 
            FormatearFechaCompleta(firstDate) : 
            ' Sin datos '}
        </strong>
        <br/>
        Ultimos datos recibidos: <strong> 
            {lastDate ? 
            FormatearFechaCompleta(lastDate) : 
            ' Sin datos '}
        </strong>
        
      </p>
      
      
      <hr/>     
      <p>
        <strong>Alarmas programadas:</strong>{' '}
        {alarms && alarms.length > 0 ? (
          <CardBtnSmall 
            title={`Ver ${alarms.length} alarma/s`} 
            url={`/panel/ubicaciones/${channel?.business_uuid}/dataloggers/${channel.datalogger_id}/canales/${channel.uuid}/alarmas`}
          />
        ) : (
          <span className={styles.noAlarms}>No hay alarmas configuradas</span>
        )}
      </p>
    </div>
  );
};

export default ChannelInfo; 