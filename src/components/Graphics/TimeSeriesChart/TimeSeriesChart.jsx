import React from 'react';
import Chart from 'react-apexcharts';
import styles from './TimeSeriesChart.module.css';
import { useTimeSeriesChart } from '../../../hooks/useTimeSeriesChart';

const TimeRangeSelector = ({ hoursBackView, onRangeChange, timeRanges }) => {
  return (
    <div className={styles.timeRangeSelector}>
      <strong>Ver últimas: </strong>
      {timeRanges.map(({ hours, label }) => (
        <button
          key={hours}
          onClick={() => onRangeChange(hours)}
          className={`${styles.btn} ${hoursBackView === hours ? styles.active : ''}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

const StatisticsDisplay = ({ statistics, hoursBackView }) => {
  return (
    <div className={styles.statistics}>
      {Object.entries(statistics).map(([field, stats]) => (
        <div key={field} className={styles.seriesStats}>
          <strong>{field}:</strong>
          <span>Máximo: {stats.max}%</span>
          <span>Promedio: {stats.avg}%</span>
          <span>Mínimo: {stats.min}%</span>
        </div>
      ))}
      <span className={styles.timeRange}>
        de las últimas {hoursBackView} horas
      </span>
    </div>
  );
};

const defaultTimeRanges = [
  { hours: 1, label: '1 Hr' },
  { hours: 12, label: '12 Hrs' },
  { hours: 24, label: '24 Hrs' },
  { hours: 48, label: '2 Días' },
  { hours: 72, label: '3 Días' },
  { hours: 96, label: '4 Días' },
  { hours: 120, label: '5 Días' },
  { hours: 8760, label: '1 Año' }
];

const TimeSeriesChart = ({
  dataSets,
  series,
  title,
  description,
  hoursBackView: initialHoursBackView = 24,
  yAxisTitle = '',
  enableZoom = true,
  showFailureMarkers = true,
  height = 300,
  timeRanges = defaultTimeRanges
}) => {
  const [hoursBackView, setHoursBackView] = React.useState(initialHoursBackView);

  // Validar que el número de dataSets coincida con el número de series
  React.useEffect(() => {
    if (dataSets.length !== series.length) {
      console.error('El número de conjuntos de datos debe coincidir con el número de series');
    }
    if (dataSets.length > 3) {
      console.error('El máximo número de series permitido es 3');
    }
  }, [dataSets, series]);

  const {
    loading,
    chartOptions,
    chartSeries,
    statistics
  } = useTimeSeriesChart({
    dataSets,
    series,
    hoursBackView,
    yAxisTitle,
    enableZoom,
    showFailureMarkers
  });

  if (loading) {
    return <div className={styles.loading}>Cargando...</div>;
  }

  return (
    <div className={styles.container}>
      {title && <h3 className={styles.title}>{title}</h3>}
      {description && <p className={styles.description}>{description}</p>}
      
      <Chart
        options={chartOptions}
        series={chartSeries}
        type="line"
        height={height}
      />

      <TimeRangeSelector
        hoursBackView={hoursBackView}
        onRangeChange={setHoursBackView}
        timeRanges={timeRanges}
      />

      <StatisticsDisplay
        statistics={statistics}
        hoursBackView={hoursBackView}
      />
    </div>
  );
};

export default TimeSeriesChart; 