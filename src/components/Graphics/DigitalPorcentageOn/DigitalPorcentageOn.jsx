import React from 'react';
import TimeSeriesChart from '../TimeSeriesChart/TimeSeriesChart';

const DigitalPorcentageOn = ({ data, currentChannelName, currentChannelTimeProm, customTimeRanges }) => {
  const series = [
    {
      name: 'Porcentaje de Encendido',
      field: 'porcentaje_encendido',
      color: '#008FFB'
    }
  ];

  const description = `Gráfico del canal "${currentChannelName}". Cada punto del gráfico integra los valores de las lecturas de los últimos ${currentChannelTimeProm} minutos.`;

  //console.log(data);

  return (
    <TimeSeriesChart
      dataSets={[data]}
      series={series}
      title={`Canal ${currentChannelName}`}
      description={description}
      yAxisTitle="Porcentaje de Encendido"
      enableZoom={true}
      showFailureMarkers={true}
      height={300}
      timeRanges={customTimeRanges}
    />
  );
};

export default DigitalPorcentageOn;
