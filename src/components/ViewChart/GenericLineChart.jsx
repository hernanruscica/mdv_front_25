import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

// Definición de Colores para Eventos
const COLOR_PHASE = "#DC2626";   // ROJO (Corte de Fase)
const COLOR_WARNING = "#FACC15"; // AMARILLO (Reset / Fallo Transmisión)
const COLOR_NORMAL = "#0052cc";  // AZUL (Normal)

const GenericLineChart = ({ 
  data = [], 
  height = 400, 
  lineColor = COLOR_NORMAL, 
  xAxisFormatter,
  onPointClick,
  isClickable = false,
  xDomain = null, 
  ticks = null    
}) => {
    
  if ((!data || data.length === 0) && !xDomain) {
    return (
      <div style={{ width: '100%', height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', border: '1px dashed #ccc', borderRadius: '4px' }}>
        Sin datos para visualizar
      </div>
    );
  }  

  // --- TOOLTIP PERSONALIZADO ---
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {

      const dataPoint = payload[0].payload;
      const dateLabel = new Date(dataPoint.date);
      let formattedDate;

      if (isNaN(dateLabel.getTime())) {
        formattedDate = dataPoint.date;
      } else {
        if (isClickable) {
            formattedDate = `Día: ${dateLabel.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' })}`;
        } else {
            formattedDate = dateLabel.toLocaleString('es-AR', { hour12: false });
        }
      }  

      // Contadores y Estados
      const countPhase = parseInt(dataPoint.phase_failures || 0);
      const countReset = parseInt(dataPoint.energy_failures || 0); // "Reset Datalogger"
      const countTransm = parseInt(dataPoint.conection_failures || 0); // "Fallo Transmision"
      
      const rawText = dataPoint.texto;
      const isPhaseEvent = dataPoint.energia === 1;

      // Color del borde del tooltip
      let eventColor = null;
      if (isPhaseEvent || countPhase > 0) eventColor = COLOR_PHASE;
      else if (countReset > 0 || countTransm > 0) eventColor = COLOR_WARNING;
      else if (rawText === 'Iniciando equipo' || rawText === 'Fallo en transmision de trama') eventColor = COLOR_WARNING;

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
          
          {/* ALERTA DE FASE (Registro Individual o Acumulado) */}
          {(isPhaseEvent || countPhase > 0) && (
             <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: COLOR_PHASE }}>
                   ⚠️ Corte de alguna fase {countPhase > 0 ? `(${countPhase})` : ''}
                </p>
             </div>
          )}

          {/* ALERTAS DE RESET Y TRANSMISIÓN */}
          {(countReset > 0 || countTransm > 0) && (
             <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                {countReset > 0 && (
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                    <span style={{color: COLOR_WARNING}}>⚡</span> Reset datalogger: {countReset}
                  </p>
                )}
                {countTransm > 0 && (
                  <p style={{ margin: '2px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                    <span style={{color: COLOR_WARNING}}>📡</span> Fallo de transmisión: {countTransm}
                  </p>
                )}
             </div>
          )}

          {/* TEXTO RAW (Si coincide con eventos puntuales) */}
          {(rawText === 'Iniciando equipo' || rawText === 'Fallo en transmision de trama' || rawText === 'Fallo de conexion con el router') && (
             <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #eee' }}>
                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 'bold', color: '#444' }}>
                   {rawText === 'Iniciando equipo' ? "⚡ Reset datalogger" : "📡 Fallo de transmisión"}
                </p>
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  // --- PUNTO PERSONALIZADO (DOT) ---
  const CustomDot = (props) => {
    const { cx, cy, payload } = props;
    const texto = payload.texto || '';

    // Prioridad 1: Corte de Fase (Rojo)
    if (payload.energia === 1) {
      return <circle cx={cx} cy={cy} r={6} fill={COLOR_PHASE} stroke="#fff" strokeWidth={2} />;
    }
    
    // Prioridad 2: Reset o Fallos (Amarillo)
    if (texto === 'Iniciando equipo' || texto === 'Fallo en transmision de trama' || texto === 'Fallo de conexion con el router') {
      return <circle cx={cx} cy={cy} r={6} fill={COLOR_WARNING} stroke="#fff" strokeWidth={2} />;
    }

    // Puntos normales interactivos
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
            type={xDomain ? "number" : "category"}
            domain={xDomain || ['auto', 'auto']}
            ticks={ticks} 
            allowDataOverflow={true} 
            scale={xDomain ? "time" : "auto"} 
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
              { value: 'Corte de alguna fase', type: 'circle', color: COLOR_PHASE },
              { value: 'Reset / Fallo Transmisión', type: 'circle', color: COLOR_WARNING }
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
            connectNulls={false} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;