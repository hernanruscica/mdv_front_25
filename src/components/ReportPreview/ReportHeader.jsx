import styles from './ReportPreview.module.css';

const ReportHeader = ({ channelData, dateRange, admins }) => {
  const business = channelData?.business;
  const channelName = channelData?.name;
  const dataloggerName = channelData?.datalogger?.name;
  const generatedDate = new Date().toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const formatDateRange = () => {
    if (!dateRange.start && !dateRange.end) {
      if (dateRange.firstDate) {
        const first = new Date(dateRange.firstDate).toLocaleDateString('es-AR');
        const last = dateRange.lastDate 
          ? new Date(dateRange.lastDate).toLocaleDateString('es-AR')
          : 'Ahora';
        return `Desde el inicio de toma de datos (${first}) al ${last}`;
      }
      return 'Desde el inicio de toma de datos';
    }
    const start = dateRange.start
      ? new Date(dateRange.start).toLocaleDateString('es-AR')
      : 'Inicio';
    const end = dateRange.end
      ? new Date(dateRange.end).toLocaleDateString('es-AR')
      : 'Ahora';
    return `${start} - ${end}`;
  };

  return (
    <div className={styles.reportHeader}>
      <div className={styles.reportHeaderTop}>
        {business?.logo_url && (
          <img
            src={business.logo_url}
            alt={business.name}
            className={styles.reportLogo}
          />
        )}
        <div className={styles.reportHeaderInfo}>
          <h2 className={styles.reportBusinessName}>{business?.name}</h2>
          <p className={styles.reportBusinessDescription}>{business?.description}</p>
          {business?.city && (
            <p className={styles.reportBusinessLocation}>
              {business.street && `${business.street}, `}
              {business.city}
            </p>
          )}
          {dataloggerName && (
            <p className={styles.reportDatalogger}>
              <strong>Datalogger:</strong> {dataloggerName}
            </p>
          )}
          {admins && admins.length > 0 && (
            <p className={styles.reportAdmins}>
              <strong>Administradores:</strong> {admins.join(', ')}
            </p>
          )}
        </div>
      </div>
      <div className={styles.reportHeaderBottom}>
        <h1 className={styles.reportTitle}>Informe de Canal</h1>
        <p className={styles.reportChannelName}>{channelName}</p>
        <div className={styles.reportMeta}>
          <span className={styles.reportMetaItem}>
            <strong>Período:</strong> {formatDateRange()}
          </span>
          <span className={styles.reportMetaItem}>
            <strong>Generado:</strong> {generatedDate}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ReportHeader;
