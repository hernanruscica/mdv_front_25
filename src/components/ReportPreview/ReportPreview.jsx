import ReportHeader from './ReportHeader';
import ReportSection from './ReportSection';
import ReportDataTable from './ReportDataTable';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/maintenanceLogOptions';
import styles from './ReportPreview.module.css';

const getStatusLabel = (status) => {
  const option = STATUS_OPTIONS.find(opt => opt.value === status);
  return option ? option.label : status;
};

const getPriorityLabel = (priority) => {
  const option = PRIORITY_OPTIONS.find(opt => opt.value === priority);
  return option ? option.label : priority;
};

const ReportPreview = ({ reportData, selectedSections, dateRange }) => {
  if (!reportData) return null;

  const { channelData, summary, alarmLogs, maintenanceLogs, hasPeriodData } = reportData;
  const hasDateRange = dateRange.start || dateRange.end;

  const maintenanceTasks = maintenanceLogs.filter(log => log.type === 'task');
  const maintenanceObservations = maintenanceLogs.filter(log => log.type === 'observation');
  const comunicationFailures = alarmLogs.filter(log => log.alarm_type === 'comunication_failure');
  const porcentageOnAlarms = alarmLogs.filter(
    log => log.alarm_type === 'porcentage_on' && log.channel_uuid === channelData.uuid
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    return num.toLocaleString('es-AR');
  };

  const taskColumns = [
    {
      header: 'Fecha',
      accessor: 'created_at',
      render: (row) => formatDate(row.created_at)
    },
    {
      header: 'Título',
      accessor: 'title'
    },
    {
      header: 'Estado',
      accessor: 'status',
      render: (row) => getStatusLabel(row.status)
    }
  ];

  const observationColumns = [
    {
      header: 'Fecha',
      accessor: 'created_at',
      render: (row) => formatDate(row.created_at)
    },
    {
      header: 'Título',
      accessor: 'title'
    },
    {
      header: 'Prioridad',
      accessor: 'priority',
      render: (row) => getPriorityLabel(row.priority)
    }
  ];

  const porcentageOnColumns = [
    {
      header: 'Fecha',
      accessor: 'triggered_at',
      render: (row) => formatDate(row.triggered_at)
    },
    {
      header: 'Nombre alarma',
      accessor: 'alarm_name'
    },
    {
      header: 'Valor',
      accessor: 'triggered_value',
      render: (row) => row.triggered_value ? row.triggered_value.toFixed(2) : '-'
    }
  ];

  return (
    <div className={styles.reportPreview}>
      <ReportHeader channelData={channelData} dateRange={dateRange} />

      {selectedSections.totalUsageHours && (
        <ReportSection title="Resumen de Uso">
          {hasDateRange && hasPeriodData ? (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Horas de uso</span>
                <span className={styles.summaryValue}>
                  {formatNumber(summary.periodUsageHours)} hs
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Promedio de funcionamiento</span>
                <span className={styles.summaryValue}>
                  {formatNumber(summary.periodAvgFunctioning)}%
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Tareas de mantenimiento</span>
                <span className={styles.summaryValue}>
                  {maintenanceTasks.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Fallos de comunicación</span>
                <span className={styles.summaryValue}>
                  {comunicationFailures.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Funcionamientos fuera de rango</span>
                <span className={styles.summaryValue}>
                  {porcentageOnAlarms.length}
                </span>
              </div>
            </div>
          ) : (
            <div className={styles.summaryGrid}>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Horas de uso totales</span>
                <span className={styles.summaryValue}>
                  {formatNumber(summary.totalUsageHours)} hs
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Promedio de funcionamiento</span>
                <span className={styles.summaryValue}>
                  {formatNumber(summary.avgFunctioning)}%
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Tareas de mantenimiento</span>
                <span className={styles.summaryValue}>
                  {maintenanceTasks.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Fallos de comunicación</span>
                <span className={styles.summaryValue}>
                  {comunicationFailures.length}
                </span>
              </div>
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Funcionamientos fuera de rango</span>
                <span className={styles.summaryValue}>
                  {porcentageOnAlarms.length}
                </span>
              </div>
            </div>
          )}
        </ReportSection>
      )}

      {selectedSections.maintenance && (
        <ReportSection title="Mantenimientos Realizados">
          <div className={styles.countBadge}>
            Total: {maintenanceTasks.length} tareas
          </div>
          <ReportDataTable
            columns={taskColumns}
            data={maintenanceTasks}
            emptyMessage="No hay tareas de mantenimiento en el período seleccionado"
          />
        </ReportSection>
      )}

      {selectedSections.maintenance && (
        <ReportSection title="Observaciones">
          <div className={styles.countBadge}>
            Total: {maintenanceObservations.length} observaciones
          </div>
          <ReportDataTable
            columns={observationColumns}
            data={maintenanceObservations}
            emptyMessage="No hay observaciones en el período seleccionado"
          />
        </ReportSection>
      )}

      {selectedSections.comunicationFailures && (
        <ReportSection title="Fallas de Comunicación">
          <div className={styles.countBadge}>
            Total: {comunicationFailures.length} eventos
          </div>
          <ReportDataTable
            columns={[
              {
                header: 'Fecha',
                accessor: 'triggered_at',
                render: (row) => formatDate(row.triggered_at)
              },
              {
                header: 'Mensaje',
                accessor: 'message'
              },
              {
                header: 'Duración',
                accessor: 'triggered_value',
                render: (row) => row.triggered_value ? `${row.triggered_value.toFixed(2)} min` : '-'
              }
            ]}
            data={comunicationFailures}
            emptyMessage="No hay fallas de comunicación en el período seleccionado"
          />
        </ReportSection>
      )}

      {/* PENDIENTE: Implementar Fallos de Energía */}
      {/* {selectedSections.energyFailures && (
        <ReportSection title="Fallos de Energía" isPlaceholder={summary.energyFailuresPlaceholder}>
          {summary.energyFailuresPlaceholder ? (
            <p className={styles.placeholderText}>
              Este módulo se encuentra en desarrollo. Próximamente se integrará la detección de fallos de energía.
            </p>
          ) : null}
        </ReportSection>
      )} */}

      {selectedSections.alarmTriggers && (
        <ReportSection title="Funcionamientos fuera de rango">
          <div className={styles.countBadge}>
            Total: {porcentageOnAlarms.length} eventos
          </div>
          <ReportDataTable
            columns={porcentageOnColumns}
            data={porcentageOnAlarms}
            emptyMessage="No hay funcionamientos fuera de rango en el período seleccionado"
          />
        </ReportSection>
      )}

      <div className={styles.reportFooter}>
        <p>Documento generado automáticamente por MDV Sensores</p>
      </div>
    </div>
  );
};

export default ReportPreview;
