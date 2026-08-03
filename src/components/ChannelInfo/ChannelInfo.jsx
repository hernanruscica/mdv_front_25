import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import styles from './ChannelInfo.module.css';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

const ChannelInfo = ({ channel, alarms, totalTime = 0, firstDate, lastDate, totalAverageTime, buttons }) => {
  
  return (
    <div className={styles.channelInfo}>
      <div className={styles.infoColumns}>
        <div className={styles.infoColumn}>
          <div className={styles.infoRow}>
            <img className={styles.infoIcon} src="/icons/folder-open-regular.svg" alt="" />
            <p><strong>Descripción:</strong> {channel?.description}</p>
          </div>
          <div className={styles.infoRow}>
            <img className={styles.infoIcon} src="/icons/clock-regular.svg" alt="" />
            <p><strong>Tiempo de Uso:</strong>{` ${totalTime || '####'} Hs.`}</p>
          </div>
          <div className={styles.infoRow}>
            <img className={styles.infoIcon} src="/icons/chart-line-solid.svg" alt="" />
            <p>
              <strong>Porcentaje de uso total:</strong>{` ${totalAverageTime || '####'} %. `}
              con datos desde <strong>
                {firstDate ? 
                  FormatearFechaCompleta(firstDate) : 
                  ' Sin datos '}
              </strong>
            </p>
          </div>
          <div className={styles.infoRow}>
            <img className={styles.infoIcon} src="/icons/history-solid.svg" alt="" />
            <p>
              Últimos datos recibidos: <strong> 
                {lastDate ? 
                  FormatearFechaCompleta(lastDate) : 
                  ' Sin datos '}
              </strong>
            </p>
          </div>
        </div>

        <div className={styles.infoColumn}>
          <div className={styles.infoRow}>
            <img className={styles.infoIcon} src="/icons/bell-regular.svg" alt="" />
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
          {buttons && (
            <div className={`${styles.infoRow} ${styles.infoRowButtons}`}>
              {buttons}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelInfo; 
