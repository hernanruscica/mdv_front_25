import { useEffect, useState } from 'react';
import { useDataStore } from '../store/dataStore';

/**
 * Hook para obtener los datos de cada canal de alarma de tipo PORCENTAJE_ENCENDIDO usando fetchDataChannel
 * @param {Array} alarms - array de alarmas
 * @returns {Object} lastDataByChannel - { [`${tabla}_${columna}`]: dataChannel }
 */
export function useAlarmsGaugesData(alarms) {
  const [lastDataByChannel, setLastDataByChannel] = useState({});
  const { fetchDataChannel } = useDataStore();

  useEffect(() => {
    if (!alarms || alarms.length === 0) return;

    const fetchAllData = async () => {
      // Filtrar solo alarmas de tipo PORCENTAJE_ENCENDIDO
      const filtered = alarms.filter(a => a.tipo_alarma === 'PORCENTAJE_ENCENDIDO' && a.tabla && a.columna);

      // Crear un objeto para almacenar los últimos datos
      const newLastData = {};

      // Iterar sobre cada alarma filtrada para obtener sus datos
      for (const alarm of filtered) {
        const { tabla, columna, periodo_tiempo } = alarm;

        // Pedimos los datos de los últimos 60 minutos para asegurar que obtenemos un valor.
        const minutosAtras = 1440;
        const tiempoPromedio = periodo_tiempo || 0;
        
        const data = await fetchDataChannel(tabla, columna, minutosAtras, tiempoPromedio);
  //console.log('parametros enviados para ', tabla, columna, minutosAtras, tiempoPromedio);

        if (data && data.length > 0) {
          // Extraer el último valor de porcentaje_encendido
          //console.log('Datos obtenidos para', `${tabla}_${columna}`, data);
          const lastValue = parseFloat(data[data.length - 1]?.porcentaje_encendido, 2);
//console.log('Último valor de porcentaje_encendido:', lastValue);

          newLastData[`${tabla}_${columna}`] = lastValue;
        } else {
          newLastData[`${tabla}_${columna}`] = null; // O un valor por defecto
        }
      }
      //console.log('Datos obtenidos para alarmas de tipo PORCENTAJE_ENCENDIDO:', newLastData);
      setLastDataByChannel(newLastData);
    };

    fetchAllData();
  }, [alarms, fetchDataChannel]);

  return lastDataByChannel;
}
