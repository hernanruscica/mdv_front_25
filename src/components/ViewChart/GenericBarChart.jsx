import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell
} from 'recharts';

// --- COLORES SEMÁFORO ---
const COLOR_MIN = "#22c55e"; // Verde
const COLOR_AVG = "#f59e0b"; // Amarillo
const COLOR_MAX = "#ef4444"; // Rojo
// ------------------------

const GenericBarChart = ({ 
  data = [], 
  height = 400, 
  onBarClick,
  xAxisFormatter
}) => {
  
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', border: '1px dashed #ccc', borderRadius: '4px' }}>
        Sin datos para visualizar
      </div>
    );
  }

  // --- FUNCIÓN HELPER SEGURA ---
  // Toma un string "YYYY-MM-DD" o ISO y devuelve "DD/MM/YYYY" 
  // SIN convertir a zona horaria local.
  const formatDateSafe = (dateStr) => {
    if (!dateStr) return '-';
    // Si viene como ISO (ej: 2025-12-22T03:00...), nos quedamos solo con la parte YYYY-MM-DD
    const cleanDate = dateStr.includes('T') ? dateStr.split('T')[0] : dateStr;
    
    // Dividimos manualmente para evitar que el navegador reste horas
    const [year, month, day] = cleanDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Componente de Tooltip Personalizado
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div style={{ backgroundColor: '#fff', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 5px' }}>{`Semana ${label}`}</p>
          
          {/* Usamos formatDateSafe en lugar de new Date().toLocaleDateString() */}
          <p style={{ fontWeight: 'normal', margin: '0 0 5px' }}>{`Del: ${formatDateSafe(dataPoint.startDate)}`}</p>
          <p style={{ fontWeight: 'normal', margin: '0 0 5px' }}>{`Al: ${formatDateSafe(dataPoint.endDate)}`}</p>
          
          <p style={{ color: COLOR_AVG, fontWeight: 'bold', margin: '5px 0 0 0' }}>{`Promedio: ${dataPoint.value}%`}</p>
          
          <hr style={{ margin: '5px 0', borderColor: '#eee' }}/>
          
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            <span style={{color: COLOR_MAX, fontWeight: 'bold'}}>▲ Máx: {dataPoint.max_val}%</span> 
            <span style={{color: '#666'}}> ({formatDateSafe(dataPoint.fecha_max)})</span>
          </p>
          
          <p style={{ fontSize: '0.85rem', margin: 0 }}>
            <span style={{color: COLOR_MIN, fontWeight: 'bold'}}>▼ Mín: {dataPoint.min_val}%</span>
            <span style={{color: '#666'}}> ({formatDateSafe(dataPoint.fecha_min)})</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%', height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
          
          {/* Ejes X superpuestos */}
          <XAxis xAxisId="0" dataKey="label" stroke="#666" tick={{ fontSize: 12 }} tickFormatter={xAxisFormatter} />
          <XAxis xAxisId="1" dataKey="label" hide />
          <XAxis xAxisId="2" dataKey="label" hide />

          <YAxis 
            domain={[0, 100]} 
            stroke="#666"
            tick={{ fontSize: 12 }}
            unit="%"
          />
          
          <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(0, 0, 0, 0.05)'}} />
          
          <Legend verticalAlign="top" height={36}/>
          
          {/* BARRA 1: MÁXIMO (Fondo - ROJO claro) */}
          <Bar 
            xAxisId="0"
            dataKey="max_val" 
            name="Máximo" 
            fill={COLOR_MAX} 
            fillOpacity={1} 
            barSize={45}
            radius={[1, 1, 0, 0]}
            onClick={(data) => onBarClick && onBarClick(data)}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />

          {/* BARRA 2: PROMEDIO (Medio - AMARILLO sólido) */}
          <Bar 
            xAxisId="1"
            dataKey="value" 
            name="Promedio" 
            fill={COLOR_AVG}
            fillOpacity={1}
            barSize={45}
            radius={[1, 1, 0, 0]}
            onClick={(data) => onBarClick && onBarClick(data)}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />

          {/* BARRA 3: MÍNIMO (Frente - VERDE sólido y delgado) */}
          <Bar 
            xAxisId="2"
            dataKey="min_val" 
            name="Mínimo" 
            fill={COLOR_MIN}
            fillOpacity={1}
            barSize={45}
            radius={[1, 1, 0, 0]}
            onClick={(data) => onBarClick && onBarClick(data)}
            style={{ cursor: onBarClick ? 'pointer' : 'default' }}
          />

        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericBarChart;