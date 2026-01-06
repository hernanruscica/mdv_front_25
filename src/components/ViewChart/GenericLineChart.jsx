import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Definición de Colores para Eventos
const COLOR_POWER_OFF = "#FACC15"; // Amarillo (Corte Energía)
const COLOR_CONN_FAIL = "#F97316"; // Naranja (Fallo Conexión)
const COLOR_NORMAL = "#0052cc";    // Azul (Normal)

const GenericLineChart = ({ 
  data = [], 
  height = 400, 
  lineColor = COLOR_NORMAL, 
  xAxisFormatter,
  onPointClick,
  isClickable = false 
}) => {
  
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', border: '1px dashed #ccc', borderRadius: '4px' }}>
        Sin datos para visualizar
      </div>
    );
  }

  // --- 1. TOOLTIP PERSONALIZADO (Actualizado) ---
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      const dateLabel = new Date(dataPoint.date);
      const formattedDate = isNaN(dateLabel.getTime()) ? dataPoint.date : dateLabel.toLocaleString();

      // A. DETECCIÓN DE DATOS (Raw vs Resumen)
      
      // Contadores (Vienen como string del backend, convertimos a int)
      const countEnergy = parseInt(dataPoint.energy_failures || 0);
      const countConn = parseInt(dataPoint.conection_failures || 0);
      
      // Texto específico (Vista detallada)
      const rawText = dataPoint.texto;

      // B. DETERMINAR COLOR DEL BORDE (Prioridad: Energía > Conexión > Normal)
      let eventColor = null;

      // Hay evento si: (Es texto de inicio) O (El contador de energía > 0)
      const isEnergyEvent = rawText === 'Iniciando equipo' || countEnergy > 0;
      
      // Hay evento si: (Es texto de fallo) O (El contador de conexión > 0)
      const isConnEvent = (rawText === 'Fallo en transmision de trama' || rawText === 'Fallo de conexion con el router') || countConn > 0;

      if (isEnergyEvent) {
        eventColor = COLOR_POWER_OFF;
      } else if (isConnEvent) {
        eventColor = COLOR_CONN_FAIL;
      }

      // C. ESTILOS
      const containerStyle = {
        backgroundColor: '#fff',
        padding: '10px',
        borderTop: '1px solid #ccc',
        borderRight: '1px solid #ccc',
        borderBottom: '1px solid #ccc',
        borderLeft: eventColor ? `4px solid ${eventColor}` : '1px solid #ccc', 
        borderRadius: '5px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
      };

      return (
        <div style={containerStyle}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{formattedDate}</p>
          <p style={{ color: lineColor, margin: 0 }}>{`Uso: ${dataPoint.value}%`}</p>
          
          {/* CASO 1: VISTA RESUMEN (Mostrar contadores si hay errores) */}
          {(countEnergy > 0 || countConn > 0) && (
             <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                {countEnergy > 0 && (
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                    ⚡ Cortes de Energía: {countEnergy}
                  </p>
                )}
                {countConn > 0 && (
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                    📡 Fallos Conexión: {countConn}
                  </p>
                )}
             </div>
          )}

          {/* CASO 2: VISTA DETALLADA (Mostrar texto específico del evento) */}
          {(rawText === 'Iniciando equipo' || rawText === 'Fallo en transmision de trama' || rawText === 'Fallo de conexion con el router') && (
             <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                   {rawText === 'Iniciando equipo' ? "⚡ Corte de Energía" : "📡 Fallo de Conexión"}
                </p>
                <p style={{ margin: '2px 0 0 0', fontSize: '0.75rem', color: '#666', fontStyle: 'italic' }}>
                  "{rawText}"
                </p>
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  // --- 2. PUNTO PERSONALIZADO (DOT) ---
  // (Esto se mantiene igual, colorea puntos individuales en la vista detallada)
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const texto = payload.texto || '';

    // CASO 1: Corte de Energía
    if (texto === 'Iniciando equipo') {
      return (
        <circle cx={cx} cy={cy} r={6} fill={COLOR_POWER_OFF} stroke="#fff" strokeWidth={2} />
      );
    }

    // CASO 2: Fallo de Conexión
    if (texto === 'Fallo en transmision de trama' || texto === 'Fallo de conexion con el router') {
      return (
        <circle cx={cx} cy={cy} r={6} fill={COLOR_CONN_FAIL} stroke="#fff" strokeWidth={2} />
      );
    }

    // CASO 3: Punto Normal
    if (isClickable) {
       return <circle cx={cx} cy={cy} r={4} fill={lineColor} stroke="none" />;
    }

    return null;
  };

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          <XAxis 
            dataKey="date" 
            tickFormatter={xAxisFormatter} 
            stroke="#666"
            tick={{ fontSize: 12 }}
            minTickGap={35}
          />
          
          <YAxis 
            domain={[0, 100]} 
            stroke="#666"
            tick={{ fontSize: 12 }}
            unit="%"
          />
          
          <Tooltip content={<CustomTooltip />} />
          
          <Legend 
            verticalAlign="top" 
            height={36}
            payload={[
              { value: 'Porcentaje de Uso', type: 'line', color: lineColor },
              { value: 'Corte de Energía', type: 'circle', color: COLOR_POWER_OFF },
              { value: 'Fallo de Conexión', type: 'circle', color: COLOR_CONN_FAIL }
            ]}
          />
          
          <Line 
            type="monotone" 
            dataKey="value"
            name="Porcentaje de Uso"
            stroke={lineColor} 
            strokeWidth={2}
            dot={<CustomDot />}
            activeDot={{ 
              r: 8, 
              cursor: isClickable ? 'pointer' : 'default', 
              onClick: (e, payload) => {
                if (isClickable && onPointClick) onPointClick(payload.payload); 
              }
            }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;