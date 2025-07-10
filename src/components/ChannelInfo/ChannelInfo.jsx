import React from 'react';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import styles from './ChannelInfo.module.css';

const ChannelInfo = ({ channel, alarms }) => {
  return (
    <div className={styles.channelInfo}>
      <p>
        Pertenece al datalogger:{' '}
        <CardBtnSmall 
          title={channel?.datalogger_nombre}
          url={`/panel/dataloggers/${channel?.datalogger_id}`}
        />
      </p>
      <p><strong>Descripción:</strong> {channel?.descripcion}</p>
      <p>
        <strong>Total de Hs de Uso:</strong> ### Hs. <br/>
        con datos desde <strong>
          {channel?.fecha_creacion ? 
            new Date(channel?.fecha_creacion).toLocaleDateString() : 
            'No disponible'}
        </strong>
      </p>
      <p>
        <strong>Alarmas programadas:</strong>{' '}
        {alarms && alarms.length > 0 ? (
          <CardBtnSmall 
            title={`Ver ${alarms.length} alarma/s`} 
            url={`/panel/dataloggers/${channel.datalogger_id}/canales/${channel.id}/alarmas`}
          />
        ) : (
          <span className={styles.noAlarms}>No hay alarmas configuradas</span>
        )}
      </p>
    </div>
  );
};

export default ChannelInfo; 