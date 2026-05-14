/**
 * Formatea una fecha ISO preservando la hora exacta que viene en el string.
 * @param {string} isoString - Fecha en formato 2026-01-14T11:36:16.000Z
 * @returns {string} - "Miércoles, 14 de enero de 2026, a las 11:36"
 */
export const FormatearFechaCompleta = (isoString) => {
  if (!isoString) return "";

  const fecha = new Date(isoString);

  const opciones = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC'
  };

  const formateador = new Intl.DateTimeFormat('es-AR', opciones);
  const partes = formateador.formatToParts(fecha);

  const d = partes.reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  
  const diaSemana = d.weekday.charAt(0).toUpperCase() + d.weekday.slice(1);
  
  return `${diaSemana}, ${d.day} de ${d.month} de ${d.year}, a las ${d.hour}:${d.minute}`;
};
