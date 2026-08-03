import { useState, useEffect } from 'react';
import GenericLineChart from '../ViewChart/GenericLineChart';
import { useDataStore } from '../../store/dataStore';
import styles from './ChannelMiniChart.module.css';

const HOURS_MS = 60 * 60 * 1000;

const ChannelMiniChart = ({ businessUuid, channelUuid }) => {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAllRegistersChannelData = useDataStore((state) => state.fetchAllRegistersChannelData);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!businessUuid || !channelUuid) return;

      setIsLoading(true);

      const timezoneOffset = Number(import.meta.env.VITE_APP_TIMEZONE_OFFSET) || -3;
      const shift = timezoneOffset * HOURS_MS;

      const end = new Date();
      const start = new Date(end.getTime() - 24 * HOURS_MS);

      const s = new Date(start.getTime() + shift).toISOString();
      const e = new Date(end.getTime() + shift).toISOString();

      const raw = await fetchAllRegistersChannelData(businessUuid, channelUuid, s, e);

      if (cancelled) return;

      const chartData = (Array.isArray(raw) ? raw : [])
        .map((item) => {
          const date = item.fecha ? new Date(item.fecha).getTime() : NaN;
          const value = Number(item.porcentaje_promedio ?? 0);
          return { date, value };
        })
        .filter((point) => !isNaN(point.date) && !isNaN(point.value))
        .sort((a, b) => a.date - b.date);

      setData(chartData);
      setIsLoading(false);
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [businessUuid, channelUuid, fetchAllRegistersChannelData]);

  if (isLoading) {
    return <div className={styles.placeholder}>Cargando datos...</div>;
  }

  return (
    <GenericLineChart
      data={data}
      containerClassName={styles.chartContainer}
      xAxisFormatter={(tick) => {
        const date = new Date(tick);
        if (isNaN(date.getTime())) return tick;
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
      }}
    />
  );
};

export default ChannelMiniChart;
