import React from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const GenericLineChart = ({ 
  data = [], 
  height = 400, 
  lineColor = "#0052cc", 
  xAxisFormatter,
  onPointClick,
  isClickable = false // <--- NUEVA PROP para controlar si se puede hacer click
}) => {
  
  if (!data || data.length === 0) {
    return (
      <div style={{ width: '100%', height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#999', border: '1px dashed #ccc', borderRadius: '4px' }}>
        Sin datos para visualizar
      </div>
    );
  }

  return (
    // Agregamos width: 100% explícito aquí para asegurar que ocupe todo el contenedor padre
    <div style={{ width: '100%', height: `${height}px` }}>
      {/* ResponsiveContainer necesita un width='99%' a veces para evitar glitches de redimensionamiento en ciertos navegadores */}
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
          
          <Tooltip 
            labelFormatter={(value) => {
              if (typeof value === 'number') return `Semana ${value}`;
              const d = new Date(value);
              return isNaN(d.getTime()) ? value : d.toLocaleString();
            }}
            formatter={(value) => [`${value}%`, 'Uso']}
            contentStyle={{ borderRadius: '6px', border: '1px solid #ddd', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          />
          
          <Legend verticalAlign="top" height={36}/>
          
          <Line 
            type="monotone" 
            dataKey="value"
            name="Porcentaje de Uso"
            stroke={lineColor} 
            strokeWidth={2}
            // Solo mostramos puntos visibles si NO es clickeable (estilo estándar)
            // O podemos dejarlos ocultos siempre y que solo aparezcan al pasar el mouse
            dot={false} 
            
            // CONFIGURACIÓN CONDICIONAL DEL CLICK
            activeDot={isClickable ? { 
              r: 8, 
              cursor: 'pointer', // Manito
              onClick: (e, payload) => {
                if (onPointClick) onPointClick(payload.payload); 
              }
            } : { 
              r: 6, // Punto normal sin cursor
              cursor: 'default'
            }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default GenericLineChart;