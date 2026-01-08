import { useState, useEffect, useMemo } from 'react';
import { PRESETS, RANGE_KEYS } from './constants/chartRanges';
import { useDataStore } from '../../store/dataStore';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import GenericLineChart from './GenericLineChart';
import GenericBarChart from './GenericBarChart';
import viewChartStyles from './viewChartStyles.module.css';

const ViewChart = ({ 
  businessUuid,
  channelUuid,
  title = "Gráfico de Datos", 
  subtitle = 'Evolución del porcentaje de uso',   
  average_period = 10,
  onRangeChange, 
  availablePresets = [ 
    RANGE_KEYS.LAST_HOUR, 
    RANGE_KEYS.LAST_24H, 
    RANGE_KEYS.LAST_WEEK, 
    RANGE_KEYS.LAST_MONTH,
    RANGE_KEYS.LAST_6_MONTHS,
    RANGE_KEYS.LAST_YEAR
  ]
}) => {
  const [activeRange, setActiveRange] = useState(availablePresets[0]);
  const [zoomedWeek, setZoomedWeek] = useState(null); 
  const [zoomedDay, setZoomedDay] = useState(null); 

  const { 
    fetchAllRegistersChannelData, 
    fetchDailyChannelData, 
    fetchWeeklyChannelData,        
    channelAllRegistersData, 
    channelDailyData, 
    channelWeeklyData,        
    loadingStates,
    error: errorLoadingData
  } = useDataStore();

  const isLoading = loadingStates.fetchAllRegistersChannelData || 
                    loadingStates.fetchDailyChannelData || 
                    loadingStates.fetchWeeklyChannelData;

  const handleWeekClick = (dataPoint) => {
    if (dataPoint && dataPoint.startDate && dataPoint.endDate) {
      const start = new Date(dataPoint.startDate);
      // start.setHours(0, 0, 0, 0); 
      const end = new Date(dataPoint.endDate);
      end.setHours(23, 59, 59, 999); 
      setZoomedWeek({ start, end, label: dataPoint.label });
      fetchDataForRange('CUSTOM_WEEK_ZOOM', start, end);
    }
  };

  const handleDayClick = (dataPoint) => {
    if (dataPoint && dataPoint.date) {
      const targetDate = new Date(dataPoint.date);
      targetDate.setHours(0, 0, 0, 0); 
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999); 
      setZoomedDay(targetDate); 
      fetchDataForRange('CUSTOM_DAY_ZOOM', targetDate, endDate);
    }
  };

  const showWeeklyBarChart = !zoomedDay && !zoomedWeek && (
    activeRange === RANGE_KEYS.LAST_6_MONTHS || 
    activeRange === RANGE_KEYS.LAST_YEAR
  );

  const standardizedData = useMemo(() => {
    let rawData = [];
    let dataType = 'unknown';

    if (zoomedDay) {
      rawData = channelAllRegistersData; 
      dataType = 'registers';
    } 
    else if (zoomedWeek) {
      rawData = channelDailyData; 
      dataType = 'daily';
    }
    else {
      switch (activeRange) {
        case RANGE_KEYS.LAST_HOUR:
        case RANGE_KEYS.LAST_12H:
        case RANGE_KEYS.LAST_24H:
          rawData = channelAllRegistersData;
          dataType = 'registers';
          break;
        case RANGE_KEYS.LAST_WEEK: 
        case RANGE_KEYS.LAST_MONTH:
          rawData = channelDailyData;
          dataType = 'daily';
          break;
        case RANGE_KEYS.LAST_6_MONTHS:
        case RANGE_KEYS.LAST_YEAR:
          rawData = channelWeeklyData;
          dataType = 'weekly';
          break;
        default: rawData = [];
      }
    }

    if (!rawData || !Array.isArray(rawData)) return [];

    return rawData.map((item) => {
      if (dataType === 'weekly') {
        return {
          label: item.numero_semana, 
          value: Number(item.porcentaje_semanal || 0),
          max_val: item.max_dia_porcentaje,
          fecha_max: item.fecha_del_maximo,
          min_val: item.min_dia_porcentaje,
          fecha_min: item.fecha_del_minimo,
          startDate: item.inicio_semana,
          endDate: item.fin_semana
        };
      }

      let date = null;
      let value = 0;
      let texto = null; 
      let conection_failures = 0;
      let energy_failures = 0;

      if (dataType === 'registers') {
        date = item.fecha; 
        value = item.porcentaje_promedio;
        texto = item.texto; 
      } 
      else if (dataType === 'daily') {
        date = item.dia || item.fecha; 
        value = item.porcentaje_uso || item.porcentaje_promedio;
        conection_failures = item.conection_failures; 
        energy_failures = item.energy_failures;
      } 

      if (!date && item.date) date = item.date;
      if (value === undefined || value === null) value = item.value || 0;

      return { 
        date: date, 
        value: Number(value), 
        texto: texto,
        conection_failures: conection_failures,
        energy_failures: energy_failures
      }; 
    });

  }, [activeRange, zoomedDay, zoomedWeek, channelAllRegistersData, channelDailyData, channelWeeklyData]);

  const isLineChartClickable = !zoomedDay && (
    activeRange === RANGE_KEYS.LAST_WEEK || 
    activeRange === RANGE_KEYS.LAST_MONTH ||
    !!zoomedWeek 
  );

  const getXAxisFormatter = (tickItem) => {
    if (tickItem === undefined || tickItem === null) return '';
    if (showWeeklyBarChart) return `Sem ${String(tickItem).slice(-2)}`;
    if (zoomedDay || activeRange === RANGE_KEYS.LAST_HOUR || activeRange === RANGE_KEYS.LAST_12H || activeRange === RANGE_KEYS.LAST_24H) {
       const date = new Date(tickItem);
       return isNaN(date.getTime()) ? tickItem : date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }
    const date = new Date(tickItem);
    return isNaN(date.getTime()) ? tickItem : date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  };

  const fetchDataForRange = async (rangeKey, start, end) => {
    if (!channelUuid) return;
    const toLocalISOString = (date) => {
      const offset = date.getTimezoneOffset() * 60000;
      return new Date(date.getTime() - offset).toISOString().slice(0, -1);
    };
    const s = toLocalISOString(start);
    const e = toLocalISOString(end);

    try {
      if (rangeKey === 'CUSTOM_DAY_ZOOM') {
        await fetchAllRegistersChannelData(businessUuid, channelUuid, s, e);
      } 
      else if (rangeKey === 'CUSTOM_WEEK_ZOOM') {
        await fetchDailyChannelData(businessUuid, channelUuid, s, e); 
      }
      else {
        switch (rangeKey) {
          case RANGE_KEYS.LAST_HOUR:
          case RANGE_KEYS.LAST_12H:
          case RANGE_KEYS.LAST_24H:
            await fetchAllRegistersChannelData(businessUuid, channelUuid, s, e); break;
          case RANGE_KEYS.LAST_WEEK:
          case RANGE_KEYS.LAST_MONTH:
            await fetchDailyChannelData(businessUuid, channelUuid, s, e); break;
          case RANGE_KEYS.LAST_6_MONTHS:
          case RANGE_KEYS.LAST_YEAR:
            await fetchWeeklyChannelData(businessUuid, channelUuid, s, e); break;
          default: break;
        }
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    setZoomedDay(null);
    setZoomedWeek(null);
    if (channelUuid && availablePresets.length > 0) {
      const { start, end } = PRESETS[activeRange].getValue();
      fetchDataForRange(activeRange, start, end);
    }
  }, [channelUuid]); // eslint-disable-line

  const handlePresetClick = (key) => {
    setZoomedDay(null);
    setZoomedWeek(null);
    setActiveRange(key);
    const { start, end } = PRESETS[key].getValue();
    if (onRangeChange) onRangeChange({ start, end, rangeKey: key });
    fetchDataForRange(key, start, end);
  };

  const handleGoBack = () => {
    if (zoomedDay) {
      if (zoomedWeek) {
        setZoomedDay(null); 
        fetchDataForRange('CUSTOM_WEEK_ZOOM', zoomedWeek.start, zoomedWeek.end); 
      } else {
        setZoomedDay(null); 
        const { start, end } = PRESETS[activeRange].getValue();
        fetchDataForRange(activeRange, start, end);
      }
    } else if (zoomedWeek) {
      setZoomedWeek(null);
      const { start, end } = PRESETS[activeRange].getValue();
      fetchDataForRange(activeRange, start, end);
    }
  };

  if (errorLoadingData) return <div style={{color:'red'}}>Error: {errorLoadingData}</div>;

  // --- LÓGICA DE SUBTÍTULO ACTUALIZADA ---
  let displayTitle = "";

  if (zoomedDay) {
    displayTitle = `Detalle del día: ${zoomedDay.toLocaleDateString()}`;
  } 
  else if (zoomedWeek) {
    displayTitle = `Detalle de la semana: Sem ${zoomedWeek.label}`;
  } 
  else {
    switch (activeRange) {
      case RANGE_KEYS.LAST_HOUR:
      case RANGE_KEYS.LAST_12H:
      case RANGE_KEYS.LAST_24H:
        displayTitle = `Cada punto del gráfico integra los valores de las lecturas de los últimos ${average_period} minutos.`;
        break;

      case RANGE_KEYS.LAST_WEEK:
      case RANGE_KEYS.LAST_MONTH:
        displayTitle = "Cada punto del gráfico integra los valores de las lecturas de todo ese dia (Click en el punto del dia, para ver detalle).";
        break;

      case RANGE_KEYS.LAST_6_MONTHS:
      case RANGE_KEYS.LAST_YEAR:
        displayTitle = "Promedios Semanales (Click en barra para ver detalle)";
        break;

      default:
        displayTitle = subtitle;
    }
  }
  // ----------------------------------------

  return (
    <div style={{width: '100%'}}>
      <div className={viewChartStyles.view_chart_header}>        
          <h2>{title}</h2>
          <h3 className={viewChartStyles.subtitle}>{displayTitle}</h3>

          {(zoomedDay || zoomedWeek) && (
            <button onClick={handleGoBack} className={viewChartStyles.btn_chart_active}>
              &larr; Volver
            </button>
          )}
        
        {!zoomedDay && !zoomedWeek && (
          <div className={viewChartStyles.view_chart_actions}>
            <strong>Ver últimas: </strong>
            {availablePresets.map((key) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key)}
                disabled={isLoading}
                className={(activeRange === key) ? viewChartStyles.btn_chart_active : viewChartStyles.btn_chart}
              >
                {PRESETS[key]?.label}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="view-chart-body" style={{ position: 'relative', minHeight: '400px', width: '100%' }}>
        {isLoading && (
          <div className="loading-overlay" style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}>
            <LoadingSpinner message="Cargando datos..." />
          </div>
        )}

        {showWeeklyBarChart ? (
           <GenericBarChart 
             key={`bar-${activeRange}`}
             data={standardizedData}
             xAxisFormatter={getXAxisFormatter}
             height={400}
             onBarClick={handleWeekClick}
           />
        ) : (
           <GenericLineChart 
             key={zoomedDay ? `day-${zoomedDay.getTime()}` : (zoomedWeek ? `week-${zoomedWeek.label}` : `normal-${activeRange}`)}
             data={standardizedData}
             xAxisFormatter={getXAxisFormatter}
             height={400}
             onPointClick={handleDayClick}
             isClickable={isLineChartClickable} 
           />
        )}
      </div>
      
      <div className="view-chart-footer" style={{ textAlign: 'right', marginTop: '10px' }}>
        <small>Vista: {zoomedDay ? 'Hora x Hora' : (zoomedWeek ? 'Día x Día' : PRESETS[activeRange]?.label)}</small>
      </div>
    </div>
  );
};

export default ViewChart;