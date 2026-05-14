import ModalTemplate from '../ModalTemplate/ModalTemplate';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';
import styles from './ModalViewBackendLog.module.css';

const LOG_TYPE_LABELS = {
  cronjob: 'Cronjob',
  user: 'Usuario',
  system: 'Sistema',
  data: 'Datos',
  users: 'Usuarios',
  businesses: 'Ubicaciones',
  alarms: 'Alarmas',
  channels: 'Canales',
  dataloggers: 'Dataloggers',
  solutions: 'Soluciones',
};

const ModalViewBackendLog = ({ isOpen, onRequestClose, log, isLoading }) => {
  let parsedExtraData = null;
  if (log?.extra_data) {
    try {
      parsedExtraData = JSON.parse(log.extra_data);
    } catch {
      parsedExtraData = null;
    }
  }

  const logLevelClass = log?.log_level === 'error'
    ? styles.levelError
    : log?.log_level === 'warn'
    ? styles.levelWarn
    : styles.levelInfo;

  const logLevelLabel = log?.log_level === 'error'
    ? 'Error'
    : log?.log_level === 'warn'
    ? 'Advertencia'
    : 'Info';

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title="Detalle del historial"
      buttons={[
        { title: 'Cerrar', onClick: onRequestClose }
      ]}
    >
      {isLoading ? (
        <LoadingSpinner message="Cargando detalle..." />
      ) : !log ? (
        <p className={styles.noData}>No se pudo cargar el detalle del evento.</p>
      ) : (
        <div className={styles.container}>
          <div className={styles.headerBadges}>
            <span className={`${styles.badge} ${styles[`type${log.log_type}`] || styles.typeDefault}`}>
              {LOG_TYPE_LABELS[log.log_type] || log.log_type}
            </span>
            <span className={`${styles.badge} ${logLevelClass}`}>
              {logLevelLabel}
            </span>
          </div>

          <div className={styles.detailGrid}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>UUID</span>
              <span className={styles.detailValue}>{log.uuid}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Acción</span>
              <span className={styles.detailValue}>{log.action || '—'}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Fecha y hora</span>
              <span className={styles.detailValue}>{FormatearFechaCompleta(log.created_at)}</span>
            </div>
          </div>

          <div className={styles.section}>
            <h4 className={styles.sectionTitle}>Detalle</h4>
            <p className={styles.detailsText}>{log.details || '—'}</p>
          </div>

          {parsedExtraData && (
            <div className={styles.section}>
              <h4 className={styles.sectionTitle}>Datos adicionales</h4>
              <table className={styles.extraDataTable}>
                <tbody>
                  {Object.entries(parsedExtraData).map(([key, value]) => (
                    <tr key={key}>
                      <td className={styles.extraDataKey}>{key}</td>
                      <td className={styles.extraDataValue}>
                        {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </ModalTemplate>
  );
};

export default ModalViewBackendLog;
