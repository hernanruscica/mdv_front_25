import React from 'react';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import styles from './ChannelInfo.module.css';

const ChannelInfo = ({ channel, alarms, datalogger = null }) => {
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
      <p>
        <strong>Total de Hs de Uso:</strong> ### Hs. <br/>
        con datos desde <strong>
          {channel?.created_at ? 
            new Date(channel?.created_at).toLocaleDateString() : 
            'No disponible'}
        </strong>
      </p>
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