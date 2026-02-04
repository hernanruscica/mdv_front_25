
import styles from './AlarmMonitorCard.module.css'; 
import CustomTag from '../CustomTag/CustomTag';
import Gauge from '../Gauge/Gauge';

const AlarmMonitorCard = ({ alarm, usageData, buttons, formatDate }) => {
  if (!alarm) return null;

  const isTriggered = alarm.triggered; 

  // Lógica del Gauge extraída para limpieza
  const renderGauge = () => {
    if (alarm.alarm_type !== "porcentage_on") return null;

    let currentMin = 0;
    let currentMax = 100;

    if (alarm.condition_logic.includes('>')) {
      currentMin = 0;
      currentMax = alarm.var01;
    } else {
      currentMin = alarm.var01;
      currentMax = 100;
    }

    return (
      <div className={styles.gaugeContainer}>
        <Gauge
          currentValue={usageData?.lastData?.porcentageUsagePeriod || 0}
          alarmMin={currentMin}
          alarmMax={currentMax}
        />
      </div>
    );
  };

  return (
    <div className={`${styles.card} ${isTriggered ? styles.triggered : styles.normal}`}>
      
      {/* 1. Header: Título y Estado Visual */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h3>{alarm.name}</h3>
          {alarm.is_active === '0' && (
            <div style={{marginTop: '5px'}}>
               <CustomTag text="Archivada" type="archive" icon="/icons/archive-solid.svg" />
            </div>
          )}
        </div>

        {/* Badge de Estado Principal */}
        <div className={`${styles.statusBadge} ${isTriggered ? styles.badgeTriggered : styles.badgeNormal}`}>
            {isTriggered ? (
                <>
                  <span>⚠️ ALARMA ACTIVA</span>
                </>
            ) : (
                <span>Normal</span>
            )}
        </div>
      </div>

      {/* 2. Grid de Detalles (Reemplaza los <p> y <br>) */}
      <div className={styles.detailsGrid}>
        <div>
          <span className={styles.label}>Condición</span>
          {alarm.condition_show}
        </div>
        <div>
          <span className={styles.label}>Tipo</span>
          {alarm.alarm_type}
        </div>
        
        <div className={styles.fullWidth}>
          <span className={styles.label}>Descripción</span>
          {alarm.description || "Sin descripción"}
        </div>

        <div className={styles.fullWidth}>
           <span className={styles.label}>Rango de análisis</span>
           Últimos {alarm.time_range} minutos
        </div>

        <div className={styles.fullWidth}>
          <span className={styles.label}>Último dato registrado</span>
          {usageData?.lastData?.last_record_date 
            ? formatDate(usageData.lastData.last_record_date) 
            : 'Sin datos recientes'}
        </div>

        <div className={styles.fullWidth}>
           <span className={styles.label}>Creada el</span>
           {new Date(alarm.created_at).toLocaleDateString()}
        </div>
      </div>

      {/* 3. Visualización Gráfica (Gauge) */}
      {renderGauge()}

      {/* 4. Botones de Acción */}
      {buttons && (
        <div className={styles.footer}>
          {buttons}
        </div>
      )}
    </div>
  );
};

export default AlarmMonitorCard;