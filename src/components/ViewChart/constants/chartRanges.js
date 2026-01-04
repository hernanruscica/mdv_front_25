// constants/chartRanges.js

export const RANGE_KEYS = {
  LAST_HOUR: 'last_hour',
  LAST_12H: 'last_12h',
  LAST_24H: 'last_24h',
  LAST_WEEK: 'last_week',
  LAST_MONTH: 'last_month',
  LAST_6_MONTHS: 'last_6_months',
  LAST_YEAR: 'last_year',
};

export const PRESETS = {
  [RANGE_KEYS.LAST_HOUR]: {
    label: '1 Hora',
    getValue: () => {
      const end = new Date();
      const start = new Date(end); // Creamos una copia
      start.setHours(end.getHours() - 1);
      return { start, end };
    },
  },
  [RANGE_KEYS.LAST_12H]: {
    label: '12 Horas',
    getValue: () => {
      const end = new Date();
      const start = new Date(end);
      start.setHours(end.getHours() - 12);
      return { start, end };
    },
  },
  [RANGE_KEYS.LAST_24H]: {
    label: '24 Horas',
    getValue: () => {
      const end = new Date();
      const start = new Date(end);
      start.setHours(end.getHours() - 24);
      return { start, end };
    },
  },
  [RANGE_KEYS.LAST_WEEK]: {
    label: '1 Semana',
    getValue: () => {
      const end = new Date();
      const start = new Date(end);
      start.setDate(end.getDate() - 7);
      return { start, end };
    },
  },
  [RANGE_KEYS.LAST_MONTH]: {
    label: '1 Mes',
    getValue: () => {
      const end = new Date();
      const start = new Date(end);
      start.setMonth(end.getMonth() - 1);
      return { start, end };
    },
  },
  [RANGE_KEYS.LAST_6_MONTHS]: {
    label: '6 Meses',
    getValue: () => {
      const end = new Date();
      const start = new Date(end);
      start.setMonth(end.getMonth() - 6);
      return { start, end };
    },
  },
  [RANGE_KEYS.LAST_YEAR]: {
    label: '1 Año',
    getValue: () => {
      const end = new Date();
      const start = new Date(end);
      start.setFullYear(end.getFullYear() - 1);
      return { start, end };
    },
  },
};