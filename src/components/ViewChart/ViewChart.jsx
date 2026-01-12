import { useState, useEffect, useMemo, useRef } from 'react';
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
  timezoneOffset = +3,
  availablePresets = [ 
    RANGE_KEYS.LAST_HOUR, 
    RANGE_KEYS.LAST_24H, 
    RANGE_KEYS.LAST_WEEK, 
    RANGE_KEYS.LAST_MONTH,
    RANGE_KEYS.LAST_6_MONTHS,
    RANGE_KEYS.LAST_YEAR
  ],
  alarmLogs = [], 
  alarmLogsComunicationFailure = [] 
}) => {
  const [activeRange, setActiveRange] = useState(availablePresets[0]);
  const [zoomedWeek, setZoomedWeek] = useState(null); 
  const [zoomedDay, setZoomedDay] = useState(null); 
  
  const nowRef = useRef(new Date());

  // --- 1. PROCESAMIENTO UNIFICADO DE ALARMAS ---
  const processedAlarms = useMemo(() => {
    const combinedAlarms = [];

    const formatAlarm = (log) => {
        let ts = new Date(log.triggered_at).getTime();
        // Ajuste de Zona Horaria a los datos de alarma (UTC -> Local)
        if (timezoneOffset !== 0) {
           ts += (timezoneOffset * 60 * 60 * 1000);
        }
        const dateStr = new Date(ts).toLocaleDateString('en-CA'); 

        return {
          timestamp: ts,
          // Guardamos el valor original, pero luego decidiremos si usarlo o no
          originalValue: log.triggered_value !== null ? Number(log.triggered_value) : null,
          message: log.message,
          alarmType: log.alarm_type, 
          dateStr: dateStr 
        };
    };

    // A. Procesar alarmLogs (Anidado)
    if (alarmLogs && Array.isArray(alarmLogs)) {
        const flatLogs = alarmLogs.flatMap(item => item.logs || []);
        flatLogs.forEach(log => {
            if (log.triggered === 1 && log.alarm_type === 'porcentage_on') {
                combinedAlarms.push(formatAlarm(log));
            }
        });
    }

    // B. Procesar alarmLogsComunicationFailure (Plano)
    if (alarmLogsComunicationFailure && Array.isArray(alarmLogsComunicationFailure)) {
        alarmLogsComunicationFailure.forEach(log => {
            if (log.triggered === 1) { 
                combinedAlarms.push(formatAlarm(log));
            }
        });
    }

    return combinedAlarms;

  }, [alarmLogs, alarmLogsComunicationFailure, timezoneOffset]);

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

  useEffect(() => {
    nowRef.current = new Date();
  }, [activeRange, channelAllRegistersData]);

  // --- HANDLERS ---
  const handleWeekClick = (dataPoint) => {
    if (dataPoint && dataPoint.startDate && dataPoint.endDate) {
      const [sy, sm, sd] = dataPoint.startDate.split('-').map(Number);
      const start = new Date(sy, sm - 1, sd, 0, 0, 0, 0); 
      const [ey, em, ed] = dataPoint.endDate.split('-').map(Number);
      const end = new Date(ey, em - 1, ed, 23, 59, 59, 999);
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

  // --- LÓGICA DE DOMINIO FIJO (EJE X) ---
  const getFixedDomain = () => {
    if (showWeeklyBarChart) return null; 
    
    if (zoomedDay) {
        const start = zoomedDay.getTime();
        const end = start + (24 * 60 * 60 * 1000); 
        return [start, end];
    }

    if (zoomedWeek) {
        return [zoomedWeek.start.getTime(), zoomedWeek.end.getTime()];
    }

    const isDailyRange = activeRange === RANGE_KEYS.LAST_WEEK || activeRange === RANGE_KEYS.LAST_MONTH;
    let start, end;

    if (isDailyRange) {
        const now = new Date();
        now.setHours(23, 59, 59, 999); 
        end = now.getTime();

        const startDate = new Date(now);
        if (activeRange === RANGE_KEYS.LAST_WEEK) startDate.setDate(startDate.getDate() - 7);
        if (activeRange === RANGE_KEYS.LAST_MONTH) startDate.setDate(startDate.getDate() - 30);
        
        startDate.setHours(0, 0, 0, 0);
        start = startDate.getTime();

    } else {
        // --- CORRECCIÓN ESCALA 1H/12H/24H ---
        // 'nowRef.current' es la hora del navegador (Local).
        // Como ya aplicamos el offset a los DATOS para llevarlos a Local,
        // el dominio también debe estar en Local.
        // NO APLICAMOS OFFSET AQUÍ, usamos la hora tal cual es.
        
        let nowTs = nowRef.current.getTime();
        
        // Sumamos un pequeño buffer visual (1 hora) a la derecha
        // para que el último punto no quede pegado al borde.
        let buffer = 60 * 60 * 1000; 
        
        end = nowTs;// + buffer; 
        let endReference = nowTs; // El cálculo hacia atrás parte del "Ahora" real

        switch (activeRange) {
          case RANGE_KEYS.LAST_HOUR:
            start = endReference - (60 * 60 * 1000); break;
          case RANGE_KEYS.LAST_12H:
            start = endReference - (12 * 60 * 60 * 1000); break;
          case RANGE_KEYS.LAST_24H:
            start = endReference - (24 * 60 * 60 * 1000); break;
          default:
            start = endReference;
        }
    }

    return [start, end];
  };

  const xDomain = getFixedDomain();

  const generateTicks = (domain) => {
    if (!domain) return null;
    const [start, end] = domain;
    const ticks = [];
    let current = start;
    let step = 0;

    if (zoomedDay) step = 2 * 60 * 60 * 1000; 
    else if (zoomedWeek) step = 24 * 60 * 60 * 1000;
    else if (activeRange === RANGE_KEYS.LAST_HOUR) step = 5 * 60 * 1000;
    else if (activeRange === RANGE_KEYS.LAST_12H) step = 60 * 60 * 1000;
    else if (activeRange === RANGE_KEYS.LAST_24H) step = 2 * 60 * 60 * 1000;
    else if (activeRange === RANGE_KEYS.LAST_WEEK) step = 24 * 60 * 60 * 1000;
    else if (activeRange === RANGE_KEYS.LAST_MONTH) step = 24 * 60 * 60 * 1000;
    else return null; 
    
    while (current <= end) {
      ticks.push(current);
      current += step;
    }
    return ticks;
  };

  const customTicks = generateTicks(xDomain);

  // --- 2. MAPEO Y ORDENAMIENTO (Integración de Alarmas) ---
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

    if (dataType === 'weekly') {
        // ... (Lógica Semanal sin cambios)
        const weeklyData = Array.isArray(rawData) ? rawData : [];
        const { start: rangeStart } = PRESETS[activeRange].getValue();
        const getMonday = (d) => {
            const date = new Date(d);
            const day = date.getDay(); 
            const diff = date.getDate() - day + (day === 0 ? -6 : 1); 
            const monday = new Date(date.setDate(diff));
            monday.setHours(0,0,0,0);
            return monday;
        };
        const toLocalYYYYMMDD = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
        const endDate = new Date(); 
        let currentWeekStart = getMonday(rangeStart);
        const finalWeekStart = getMonday(endDate);
        const fullWeeks = [];
        while (currentWeekStart <= finalWeekStart) {
            const currentWeekEnd = new Date(currentWeekStart);
            currentWeekEnd.setDate(currentWeekStart.getDate() + 6);
            const startStr = toLocalYYYYMMDD(currentWeekStart);
            const endStr = toLocalYYYYMMDD(currentWeekEnd);
            const foundData = weeklyData.find(d => {
                if (!d.inicio_semana) return false;
                const apiDate = d.inicio_semana.includes('T') ? d.inicio_semana.split('T')[0] : d.inicio_semana;
                return apiDate === startStr; 
            });
            const getWeekNumber = (d) => {
                const date = new Date(d.getTime());
                date.setHours(0, 0, 0, 0);
                date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);
                const week1 = new Date(date.getFullYear(), 0, 4);
                return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);
            };
            const weekLabel = foundData ? foundData.numero_semana : getWeekNumber(currentWeekStart);
            fullWeeks.push({
                label: weekLabel,
                value: foundData ? Number(foundData.porcentaje_semanal || 0) : 0,
                max_val: foundData ? foundData.max_dia_porcentaje : 0,
                fecha_max: foundData ? foundData.fecha_del_maximo : null,
                min_val: foundData ? foundData.min_dia_porcentaje : 0,
                fecha_min: foundData ? foundData.fecha_del_minimo : null,
                startDate: startStr,
                endDate: endStr      
            });
            currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        }
        return fullWeeks;
    }

    if (!rawData || !Array.isArray(rawData)) return [];

    // A. Mapeo de datos NORMALES
    let mappedData = rawData.map((item) => {
      let date = null;
      let value = 0;
      let texto = null; 
      let conection_failures = 0;
      let energy_failures = 0;
      let phase_failures = 0; 
      let energia = 0;
      let alarm_count = 0;

      if (dataType === 'registers') {
        date = item.fecha; 
        value = item.porcentaje_promedio;
        texto = item.texto; 
        energia = Number(item.energia || 0);
      } 
      else if (dataType === 'daily') {
        date = item.dia || item.fecha; 
        value = item.porcentaje_uso || item.porcentaje_promedio;
        conection_failures = Number(item.conection_failures || 0); 
        energy_failures = Number(item.energy_failures || 0);
        phase_failures = Number(item.phase_failures || 0);
      } 

      if (!date && item.date) date = item.date;
      if (value === undefined || value === null) value = item.value || 0;

      let finalDate = date;
      if (date && typeof date === 'string') {
          if (date.includes('T')) {
             const d = new Date(date);
             if (!isNaN(d.getTime())) finalDate = d.getTime();
          } else {
             const [y, m, d] = date.split('-').map(Number);
             finalDate = new Date(y, m - 1, d).getTime();
          }
      }

      if (typeof finalDate === 'number' && timezoneOffset !== 0) {
          finalDate += (timezoneOffset * 60 * 60 * 1000);
      }

      // --- CÁLCULO DE CONTADOR DE ALARMAS DIARIO ---
      if (dataType === 'daily') {
          const pointDateStr = new Date(finalDate).toLocaleDateString('en-CA');
          alarm_count = processedAlarms.filter(a => a.dateStr === pointDateStr).length;
      }

      return { 
        date: finalDate, 
        value: Number(value), 
        texto: texto,
        conection_failures,
        energy_failures,
        phase_failures, 
        energia,
        alarm_count,
        isAlarm: false,
        alarmType: null
      }; 
    });

    // B. Inyección de ALARMAS (Solo en vista detallada)
    if (dataType === 'registers' && processedAlarms.length > 0) {
        
        const alarmPoints = processedAlarms.map(alarm => {
            let yValue = alarm.originalValue;

            // --- CORRECCIÓN PUNTOS VERDES (PEGAR A LÍNEA) ---
            // Si es fallo de comunicación (o si no tiene valor propio),
            // buscamos el punto de datos del sensor más cercano para "pegarlo" a la línea.
            // Esto asegura que el punto verde no quede "volando" en 3.08 (minutos) cuando el eje Y es 0-100%.
            if (alarm.alarmType === 'comunication_failure' || yValue === null) {
                if (mappedData.length > 0) {
                    const closest = mappedData.reduce((prev, curr) => {
                        return (Math.abs(curr.date - alarm.timestamp) < Math.abs(prev.date - alarm.timestamp) ? curr : prev);
                    });
                    
                    // Asignamos el valor de la serie si existe
                    if (closest && closest.value !== null && closest.value !== undefined) {
                        yValue = closest.value;
                    }
                }
            }

            // Si aún así es null, no lo mostramos
            if (yValue === null || yValue === undefined) return null;

            return {
                date: alarm.timestamp, 
                value: yValue,
                texto: alarm.message, 
                isAlarm: true,        
                alarmType: alarm.alarmType, 
                conection_failures: 0,
                energy_failures: 0,
                phase_failures: 0,
                energia: 0,
                alarm_count: 0
            };
        }).filter(p => p !== null); 

        mappedData = [...mappedData, ...alarmPoints];
    }

    const sortedData = mappedData.sort((a, b) => a.date - b.date);

    const dataWithGaps = [];
    let gapThreshold = 0;
    if (dataType === 'daily') {
        gapThreshold = 26 * 60 * 60 * 1000; 
    } else {
        gapThreshold = (average_period || 10) * 3 * 60 * 1000;
    }

    for (let i = 0; i < sortedData.length; i++) {
        const currentItem = sortedData[i];
        dataWithGaps.push(currentItem);

        if (i < sortedData.length - 1) {
            const nextItem = sortedData[i + 1];
            const diff = nextItem.date - currentItem.date;

            if (diff > gapThreshold) {
                dataWithGaps.push({
                    date: currentItem.date + (diff / 2), 
                    value: null
                });
            }
        }
    }

    return dataWithGaps;

  }, [activeRange, zoomedDay, zoomedWeek, channelAllRegistersData, channelDailyData, channelWeeklyData, timezoneOffset, average_period, processedAlarms]);

  // ... (Resto del código sin cambios) ...
  const isLineChartClickable = !zoomedDay && (
    activeRange === RANGE_KEYS.LAST_WEEK || 
    activeRange === RANGE_KEYS.LAST_MONTH ||
    !!zoomedWeek 
  );

  const getXAxisFormatter = (tickItem) => {
    if (tickItem === undefined || tickItem === null) return '';
    if (showWeeklyBarChart) return `Sem ${String(tickItem).slice(-2)}`;
    
    const date = new Date(tickItem);
    if (isNaN(date.getTime())) return tickItem;

    if (zoomedDay || activeRange === RANGE_KEYS.LAST_HOUR || activeRange === RANGE_KEYS.LAST_12H || activeRange === RANGE_KEYS.LAST_24H) {
       return date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false });
    }
    
    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
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
  }, [channelUuid]); 

  const handlePresetClick = (key) => {
    setZoomedDay(null);
    setZoomedWeek(null);
    setActiveRange(key);
    nowRef.current = new Date(); 
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

  let displayTitle = "";
  if (zoomedDay) {
    displayTitle = `Todos los registros, integración: ${average_period} min. Detalle del día: ${zoomedDay.toLocaleDateString()}`;
  } 
  else if (zoomedWeek) {
    const weekStart = zoomedWeek.start.toLocaleDateString();
    const weekEnd = zoomedWeek.end.toLocaleDateString();
    const weekNumber = zoomedWeek.label ? zoomedWeek.label.toString().slice(-2) : '--';
    const yearNumber = zoomedWeek.label ? zoomedWeek.label.toString().slice(0,4) : '----';
    displayTitle = `Semana: ${weekNumber} de ${yearNumber} (${weekStart} al ${weekEnd}). Promedios diarios. (Click para detalle)`;
  } 
  else {
    switch (activeRange) {
      case RANGE_KEYS.LAST_HOUR:
      case RANGE_KEYS.LAST_12H:
      case RANGE_KEYS.LAST_24H:
        displayTitle = `Todos los registros, integración: ${average_period} min.`;
        break;
      case RANGE_KEYS.LAST_WEEK:
      case RANGE_KEYS.LAST_MONTH:
        displayTitle = "Promedios diarios. (Click para detalle)";
        break;
      case RANGE_KEYS.LAST_6_MONTHS:
      case RANGE_KEYS.LAST_YEAR:
        displayTitle = "Promedios semanales.(Click para detalle)";
        break;
      default:
        displayTitle = subtitle;
    }
  }

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
             xDomain={xDomain} 
             ticks={customTicks}
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