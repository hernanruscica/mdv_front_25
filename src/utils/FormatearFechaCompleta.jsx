/**
 * Formatea una fecha ISO a un formato amigable en español.
 * @param {string} isoString - Fecha en formato 2026-01-03T23:22:25.000Z
 * @returns {string} - "Sábado, 3 de enero de 2026, a las 23:22"
 */
export const FormatearFechaCompleta = (isoString) => {
  if (!isoString) return "";

  const fecha = new Date(isoString);

  // Configuramos el formateador de JS
  const opciones = {
    weekday: 'long', // "sábado"
    year: 'numeric', // "2026"
    month: 'long',   // "enero"
    day: 'numeric',  // "3"
    hour: '2-digit', // "23"
    minute: '2-digit', // "22"
    hour12: false    // Formato 24h
  };

  const formateador = new Intl.DateTimeFormat('es-ES', opciones);
  const partes = formateador.formatToParts(fecha);

  // Construimos la cadena manualmente para insertar el "a las" exacto que pides
  // y capitalizar la primera letra del día.
  const d = partes.reduce((acc, p) => ({ ...acc, [p.type]: p.value }), {});
  
  const diaSemana = d.weekday.charAt(0).toUpperCase() + d.weekday.slice(1);
  
  return `${diaSemana}, ${d.day} de ${d.month} de ${d.year}, a las ${d.hour}:${d.minute}`;
};
