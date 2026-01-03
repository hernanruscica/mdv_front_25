import { useState, useEffect } from 'react';
import { PRESETS, RANGE_KEYS } from './constants/chartRanges';

const ViewChart = ({ 
  title = "Gráfico de Datos", 
  subtitle = 'Se muestran los datos en un grafico',
  children, 
  onRangeChange, 
  availablePresets = [ 
    RANGE_KEYS.LAST_HOUR, 
    RANGE_KEYS.LAST_24H, 
    RANGE_KEYS.LAST_WEEK, 
    RANGE_KEYS.LAST_MONTH 
  ],
  className = "" // Clase contenedora que tú pases
}) => {
  const [activeRange, setActiveRange] = useState(availablePresets[0]);

  // Efecto inicial: Carga el primer preset al montar el componente
  useEffect(() => {
    if (availablePresets.length > 0) {
      handlePresetClick(availablePresets[0]);
    }
  }, []);

  const handlePresetClick = (key) => {
    setActiveRange(key);
    
    // Obtenemos las fechas calculadas (usando tu versión Vanilla JS)
    const { start, end } = PRESETS[key].getValue();
    
    // --- LOGS PARA DEBUG ---
    console.log('--- Cambio de Rango Detectado ---');
    console.log('Preset:', PRESETS[key].label);
    console.log('Fecha Inicio (Start):', start.toLocaleString());
    console.log('Fecha Fin (End):', end.toLocaleString());
    // -----------------------
    
    if (onRangeChange) {
      console.log('HAY onRangeChange');
      
      onRangeChange({ start, end, rangeKey: key });
    }
  };

  return (
    <div className={className}>
      {/* Header: Título y Botones */}
      <div className="view-chart-header">
        <h2>{title}</h2>
        <h3>{subtitle}</h3>
        
        <div className="view-chart-actions">
          {availablePresets.map((key) => {
            const preset = PRESETS[key];
            if (!preset) return null;

            return (
              <button
                key={key}
                type="button"
                onClick={() => handlePresetClick(key)}
                // Solo lógica condicional simple para que apliques tus clases CSS
                className={activeRange === key ? 'btn-active' : 'btn-inactive'}
              >
                {preset.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cuerpo del gráfico */}
      <div className="view-chart-body">
        {children ? children : <span>El gráfico se renderiza aquí</span>}
      </div>
      
      {/* Footer informativo */}
      <div className="view-chart-footer">
        <small>
          Filtro actual: {PRESETS[activeRange]?.label}
        </small>
      </div>
    </div>
  );
};

export default ViewChart;