import { useState, useEffect, useMemo } from 'react';

const WEEK_IN_HOURS = 168; // 7 días * 24 horas

const calculateStatistics = (data, field) => {
  if (!data || data.length === 0) return { max: 0, min: 0, avg: 0 };
  
  const values = data.map(item => parseFloat(item[field])).filter(val => !isNaN(val));
  const max = Math.max(...values);
  const min = Math.min(...values);
  const avg = (values.reduce((sum, val) => sum + val, 0) / values.length).toFixed(2);
  
  return { max, min, avg };
};

// Función auxiliar para agrupar datos por día
const groupDataByDay = (data) => {
  const groupedData = {};
  
  data.forEach(point => {
    const date = new Date(point.x);
    const dayKey = date.toISOString().split('T')[0];
    
    if (!groupedData[dayKey]) {
      groupedData[dayKey] = {
        values: [],
        failures: []
      };
    }
    
    groupedData[dayKey].values.push(point.y);
    if (point.failure) {
      groupedData[dayKey].failures.push(point.failure);
    }
  });

  // Calcular promedio por día
  return Object.entries(groupedData).map(([dayKey, dayData]) => {
    const avgValue = dayData.values.reduce((a, b) => a + b, 0) / dayData.values.length;
    const hasFailure = dayData.failures.length > 0;
    
    return {
      x: new Date(dayKey).getTime(),
      y: Number(avgValue.toFixed(2)),
      failure: hasFailure
    };
  }).sort((a, b) => a.x - b.x);
};

export const useTimeSeriesChart = ({
  dataSets,
  series,
  hoursBackView,
  yAxisTitle,
  enableZoom,
  showFailureMarkers
}) => {
  const [loading, setLoading] = useState(true);

  // Procesar los datos para cada serie
  const processedData = useMemo(() => {
    return dataSets.map((data, index) => {
      const currentSeries = series[index];
      if (!data || !currentSeries) return [];

      // Filtrar por rango de tiempo
      const filteredData = data
        .filter(point => {
          const pointDate = new Date(point.timestamp);
          const cutoffDate = new Date();
          cutoffDate.setHours(cutoffDate.getHours() - hoursBackView);
          return pointDate >= cutoffDate;
        })
        .map(point => ({
          x: new Date(point.timestamp).getTime(),
          y: point[currentSeries.field],
          failure: point.failure || false
        }))
        .sort((a, b) => a.x - b.x);

      // Si el rango es mayor a una semana, agrupar por días
      if (hoursBackView > WEEK_IN_HOURS) {
        return groupDataByDay(filteredData);
      }

      return filteredData;
    });
  }, [dataSets, series, hoursBackView]);

  // Calcular estadísticas para cada serie
  const statistics = useMemo(() => {
    const stats = {};
    processedData.forEach((data, index) => {
      if (!data.length) return;

      const values = data.map(point => point.y);
      const seriesName = series[index].name;
      
      stats[seriesName] = {
        max: Math.max(...values).toFixed(2),
        min: Math.min(...values).toFixed(2),
        avg: (values.reduce((a, b) => a + b, 0) / values.length).toFixed(2)
      };
    });
    return stats;
  }, [processedData, series]);

  // Configurar las opciones del gráfico
  const chartOptions = useMemo(() => {
    const tooltipFormat = hoursBackView > WEEK_IN_HOURS ? 'dd MMM yyyy' : 'dd MMM yyyy HH:mm';
    
    return {
      chart: {
        type: 'line',
        zoom: {
          enabled: enableZoom,
          type: 'x',
          autoScaleYaxis: true
        },
        toolbar: {
          show: enableZoom,
          tools: {
            download: true,
            selection: true,
            zoom: true,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true
          }
        }
      },
      stroke: {
        curve: 'smooth',
        width: 2
      },
      markers: {
        size: hoursBackView > WEEK_IN_HOURS ? 4 : 0, // Mostrar marcadores para datos diarios
        hover: {
          size: 5
        }
      },
      xaxis: {
        type: 'datetime',
        labels: {
          datetimeUTC: false,
          format: tooltipFormat
        }
      },
      yaxis: {
        title: {
          text: yAxisTitle
        },
        labels: {
          formatter: (value) => `${value}%`
        }
      },
      tooltip: {
        x: {
          format: tooltipFormat
        }
      },
      annotations: showFailureMarkers ? {
        points: processedData.flat()
          .filter(point => point.failure)
          .map(point => ({
            x: point.x,
            y: point.y,
            marker: {
              size: 5,
              fillColor: '#ff0000',
              strokeColor: '#ff0000'
            },
            label: {
              text: 'Falla'
            }
          }))
      } : undefined
    };
  }, [processedData, yAxisTitle, enableZoom, showFailureMarkers, hoursBackView]);

  // Preparar las series para el gráfico
  const chartSeries = useMemo(() => {
    return series.map((seriesConfig, index) => ({
      name: seriesConfig.name,
      data: processedData[index] || [],
      color: seriesConfig.color
    }));
  }, [processedData, series]);

  useEffect(() => {
    setLoading(false);
  }, []);

  return {
    loading,
    chartOptions,
    chartSeries,
    statistics
  };
}; 