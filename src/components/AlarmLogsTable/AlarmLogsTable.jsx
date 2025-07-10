import React, { useMemo } from 'react';
import Table from '../Table/Table';
import styles from './AlarmLogsTable.module.css';

const AlarmLogsTable = ({ logs, onLogClick }) => {
  const columns = [
    { label: 'DIA Y HORA DEL EVENTO', accessor: 'fecha', icon: '/icons/clock-regular.svg' },
    { label: 'EVENTO', accessor: 'evento', icon: '/icons/flag-regular.svg' },
    { label: 'MENSAJE', accessor: 'mensaje', icon: '/icons/envelope-regular.svg' },    
    { label: 'USUARIOS NOTIFICADOS', accessor: 'usuarios', icon: '/icons/user-regular.svg' }
  ];

  const preparedLogs = useMemo(() => {
    const eventosMap = new Map();

    logs.forEach(log => {
      if (!eventosMap.has(log.id)) {
        eventosMap.set(log.id, {
          fecha: new Date(log.fecha_disparo).toLocaleString(),
          fecha_vista: new Date(log.fecha_vista).toLocaleString(),
          evento: log.disparada == 0 ? 'Reset' : 'Disparo',
          id: log.id,
          mensaje: log.mensaje,
          usuarios: 1,
          usuarios_afectados: [{
            nombre: log.nombre_1,
            apellido: log.apellido_1,
            email: log.email,
            vista: (log.fecha_vista == '2024-01-01T03:00:00.000Z') ? false : true,
          }]
        });
      } else {
        const evento = eventosMap.get(log.id);
        evento.usuarios += 1;
        evento.usuarios_afectados.push({
          nombre: log.nombre_1,
          apellido: log.apellido_1,
          email: log.email,
          vista: (log.fecha_vista == '2024-01-01T03:00:00.000Z') ? false : true,
        });
      }
    });

    return Array.from(eventosMap.values());
  }, [logs]);

  return (
    <div className={styles.tableContainer}>
      <Table 
        columns={columns}
        data={preparedLogs}
        onRowClick={onLogClick}
      />
    </div>
  );
};

export default AlarmLogsTable; 