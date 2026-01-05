import { useState, useEffect, useMemo } from 'react';
import { PRESETS, RANGE_KEYS } from './constants/chartRanges';
import { useDataStore } from '../../store/dataStore';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import GenericLineChart from './GenericLineChart';
import viewChartStyles from './viewChartStyles.module.css'

const ViewChart = ({ 
  channelUuid,
  title = "Gráfico de Datos", 
  subtitle = 'Evolución del porcentaje de uso',   
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

  // --- LÓGICA: ¿DEBE SER CLICKEABLE? ---
  // Solo habilitamos el click si:
  // 1. NO estamos ya en modo Zoom (detalle).
  // 2. La vista actual es SEMANAL o MENSUAL.
  const showClickablePoints = !zoomedDay && (
    activeRange === RANGE_KEYS.LAST_WEEK || 
    activeRange === RANGE_KEYS.LAST_MONTH
  );

  const handlePointClick = (dataPoint) => {
    // Doble chequeo de seguridad
    if (showClickablePoints && dataPoint && dataPoint.date) {
      console.log("Haciendo Zoom al día:", dataPoint.date);
      const targetDate = new Date(dataPoint.date);
      targetDate.setHours(0, 0, 0, 0); 
      
      const endDate = new Date(targetDate);
      endDate.setHours(23, 59, 59, 999); 

      setZoomedDay(targetDate); 
      fetchDataForRange('CUSTOM_ZOOM', targetDate, endDate);
    }
  };

  // --- LÓGICA DE NORMALIZACIÓN ---
  const standardizedData = useMemo(() => {
    let rawData = [];
    let dataType = 'unknown';

    if (zoomedDay) {
      rawData = channelAllRegistersData; 
      dataType = 'registers';
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
      let date = null;
      let value = 0;

      if (dataType === 'registers') {
        date = item.fecha; 
        value = item.porcentaje_promedio;
      } 
      else if (dataType === 'daily') {
        date = item.dia || item.fecha; 
        value = item.porcentaje_uso || item.porcentaje_promedio; 
      } 
      else if (dataType === 'weekly') {
        date = item.numero_semana; 
        value = item.porcentaje_semanal || item.porcentaje_promedio;
      }

      if (!date && item.date) date = item.date;
      if (value === undefined || value === null) value = item.value || 0;

      return { date: date, value: Number(value) };
    });

  }, [activeRange, zoomedDay, channelAllRegistersData, channelDailyData, channelWeeklyData]);

  // --- FORMATEADOR VISUAL ---
  const getXAxisFormatter = (tickItem) => {
    if (tickItem === undefined || tickItem === null) return '';

    if (zoomedDay) {
       const date = new Date(tickItem);
       return isNaN(date.getTime()) ? tickItem : date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
    }

    if (activeRange === RANGE_KEYS.LAST_6_MONTHS || activeRange === RANGE_KEYS.LAST_YEAR) {
        return `Sem ${tickItem}`;
    }

    const date = new Date(tickItem);
    if (isNaN(date.getTime())) return tickItem;

    switch (activeRange) {
      case RANGE_KEYS.LAST_HOUR:
      case RANGE_KEYS.LAST_12H:
      case RANGE_KEYS.LAST_24H:
        return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
      case RANGE_KEYS.LAST_WEEK:
      case RANGE_KEYS.LAST_MONTH:
        return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
      default:
        return date.toLocaleDateString();
    }
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
      if (rangeKey === 'CUSTOM_ZOOM') {
        await fetchAllRegistersChannelData(channelUuid, s, e);
        return;
      }

      switch (rangeKey) {
        case RANGE_KEYS.LAST_HOUR:
        case RANGE_KEYS.LAST_12H:
        case RANGE_KEYS.LAST_24H:
          await fetchAllRegistersChannelData(channelUuid, s, e); break;
        case RANGE_KEYS.LAST_WEEK:
        case RANGE_KEYS.LAST_MONTH:
          await fetchDailyChannelData(channelUuid, s, e); break;
        case RANGE_KEYS.LAST_6_MONTHS:
        case RANGE_KEYS.LAST_YEAR:
          await fetchWeeklyChannelData(channelUuid, s, e); break;
        default: break;
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (channelUuid && availablePresets.length > 0) {
      const { start, end } = PRESETS[activeRange].getValue();
      fetchDataForRange(activeRange, start, end);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelUuid]);

  const handlePresetClick = (key) => {
    setZoomedDay(null); 
    setActiveRange(key);
    const { start, end } = PRESETS[key].getValue();
    if (onRangeChange) onRangeChange({ start, end, rangeKey: key });
    fetchDataForRange(key, start, end);
  };

  if (errorLoadingData) return <div style={{color:'red'}}>Error: {errorLoadingData}</div>;

  console.log('active range', activeRange);
  

  return (
    <div style={{width: '100%'}}>
      <div className={viewChartStyles.view_chart_header}>        
          <h2>{title}</h2>
          <h3 className={viewChartStyles.subtitle}>
            {(!zoomedDay && (activeRange == 'last_week' || activeRange == 'last_month')) 
            ? 'Cada punto del gráfico integra los valores de todo el dia.'             
            : (activeRange == 'last_6_months' || activeRange == 'last_year')
              ? 'Cada punto del gráfico integra los valores de toda la semana'
              : subtitle}
          </h3>

          {zoomedDay ?
            <h3>{`Detalle del día: ${zoomedDay.toLocaleDateString()}`}</h3>
            : ''
          }
          {zoomedDay && (
            <button 
              onClick={() => handlePresetClick(activeRange)}
              // style={{ fontSize: '0.8rem', color: '#0052cc', textDecoration: 'underline', border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
              className={viewChartStyles.btn_chart_active}
            >
              &larr; Volver a vista general
            </button>
          )}
        
        {!zoomedDay && (
          <div className={viewChartStyles.view_chart_actions}>
            <strong>Ver últimas: </strong>
            {availablePresets.map((key) => (
              <button
                key={key}
                onClick={() => handlePresetClick(key)}
                disabled={isLoading}
                //className={`btn_chart ${activeRange === key && !zoomedDay ? 'active' : ''}`}
                className={(activeRange === key && !zoomedDay) ? viewChartStyles.btn_chart_active : viewChartStyles.btn_chart}
              >
                {PRESETS[key]?.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Agregamos width: 100% aquí para asegurar el ancho correcto al cambiar de vista */}
      <div className="view-chart-body" style={{ position: 'relative', minHeight: '400px', width: '100%' }}>
        {isLoading && (
          <div className="loading-overlay" style={{
            position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.8)', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10
          }}>
            <LoadingSpinner message="Cargando detalle..." />
          </div>
        )}

        <GenericLineChart 
          key={zoomedDay ? `zoom-${zoomedDay.toISOString()}` : `normal-${activeRange}`}
          data={standardizedData}
          xAxisFormatter={getXAxisFormatter}
          height={400}
          onPointClick={handlePointClick}
          isClickable={showClickablePoints} // <--- Pasamos la prop de control
        />
        
      </div>
      
      <div className="view-chart-footer" style={{ textAlign: 'right', marginTop: '10px' }}>
        <small>Vista: {zoomedDay ? 'Detalle por Hora' : PRESETS[activeRange]?.label}</small>
      </div>
    </div>
  );
};

export default ViewChart;