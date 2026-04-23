import ReportHeader from './ReportHeader';
import ReportSection from './ReportSection';
import ReportDataTable from './ReportDataTable';
import ViewChart from '../ViewChart/ViewChart';
import { RANGE_KEYS } from '../ViewChart/constants/chartRanges';
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

const getTipoCorte = (energia) => {
  return energia === 1 ? 'Corte de 1 fase' : 'Corte de las 3 fases';
};

const ReportPreview = ({ reportData, selectedSections, dateRange, admins, showChart = true }) => {
  if (!reportData) return null;

  const { channelData, summary, alarmLogs, maintenanceLogs, hasPeriodData, energyIncidents } = reportData;
  const hasDateRange = dateRange.start || dateRange.end;

  const dateRangeInfo = {
    ...dateRange,
    firstDate: summary.firstDate,
    lastDate: summary.lastDate
  };

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

  const energyIncidentsFormatted = (energyIncidents || []).map(incident => ({
    ...incident,
    tipoCorte: getTipoCorte(incident.energia),
    fechaFormateada: incident.fecha ? formatDate(incident.fecha) : '-'
  }));

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

  const energyColumns = [
    {
      header: 'Fecha',
      accessor: 'fechaFormateada'
    },
    {
      header: 'Tipo de corte',
      accessor: 'tipoCorte'
    },
    {
      header: 'Descripción',
      accessor: 'texto'
    },
    {
      header: 'Energía',
      accessor: 'energia',
      render: (row) => row.energia === 1 ? '1' : '0'
    }
  ];

  const currentAlarmsLogs = porcentageOnAlarms.map(log => ({
    uuid: log.alarm_uuid,
    logs: [log]
  }));

  return (
    <div className={styles.reportPreview}>
      <ReportHeader channelData={channelData} dateRange={dateRangeInfo} admins={admins} />

      {showChart && selectedSections.chart && (
        <ReportSection title="Gráfico de Funcionamiento">
          <div className={styles.reportChartWrapper}>
            <ViewChart
              businessUuid={channelData.business_uuid}
              channelUuid={channelData.uuid}
              title={`Datos del canal '${channelData.name}'`}
              subtitle={`Integración: ${channelData.averaging_period} minutos`}
              average_period={channelData.averaging_period}
              availablePresets={[
                RANGE_KEYS.LAST_HOUR,
                RANGE_KEYS.LAST_12H,
                RANGE_KEYS.LAST_24H,
                RANGE_KEYS.LAST_WEEK,
                RANGE_KEYS.LAST_MONTH,
                RANGE_KEYS.LAST_6_MONTHS,
                RANGE_KEYS.LAST_YEAR
              ]}
              alarmLogs={currentAlarmsLogs}
              alarmLogsComunicationFailure={comunicationFailures}
            />
          </div>
        </ReportSection>
      )}

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
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Fallos de energía</span>
                <span className={styles.summaryValue}>
                  {summary.energyFailuresCount || 0}
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
              <div className={styles.summaryItem}>
                <span className={styles.summaryLabel}>Fallos de energía</span>
                <span className={styles.summaryValue}>
                  {summary.energyFailuresCount || 0}
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

      {selectedSections.energyFailures && (
        <ReportSection title="Fallos de Energía">
          <div className={styles.countBadge}>
            Total: {summary.energyFailuresCount || 0} eventos
          </div>
          <ReportDataTable
            columns={energyColumns}
            data={energyIncidentsFormatted}
            emptyMessage="No hay incidentes de energía en el período seleccionado"
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
