import React, { useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useUsersStore } from '../../store/usersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import Table from '../../components/Table/Table';
import styles from './ViewAlarm.module.css';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ModalViewAlarmLog from '../../components/ModalViewAlarmLog/ModalViewAlarmLog';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import Gauge from '../../components/Gauge/Gauge';
import { useAlarmDetails } from '../../hooks/useAlarmDetails';
import { useChannelDetails } from '../../hooks/useChannelDetails';
import DigitalPorcentageOn from '../../components/Graphics/DigitalPorcentageOn/DigitalPorcentageOn';
import AnalogData from '../../components/Graphics/AnalogData/AnalogData';
import TimeSeriesChart from '../../components/Graphics/TimeSeriesChart/TimeSeriesChart';

// Definimos los rangos de tiempo personalizados para los gráficos
const customTimeRanges = [
  { hours: 1, label: '1 Hr' },
  { hours: 6, label: '6 Hrs' },
  { hours: 12, label: '12 Hrs' },
  { hours: 24, label: '1 Día' },
  { hours: 72, label: '3 Días' },
  { hours: 168, label: '1 Semana' }
];

const ViewAlarm = () => {
  const { alarmId, userId, locationId } = useParams();
  const location = useLocation();
  const [modalArchiveOpen, setModalArchiveOpen] = useState(false);
  const [modalLogOpen, setModalLogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // Hook para datos de la alarma
  const {
    currentAlarm,
    alarmLogs,
    currentChannel,
    secondaryChannel,
    currentDatalogger,
    isLoadingAlarm,
    errorAlarm,
    refreshAlarm
  } = useAlarmDetails(alarmId);

  // Hooks para datos de los canales
  const {
    dataChannel: primaryChannelData,
    isLoading: isLoadingPrimaryChannel,
    error: errorPrimaryChannel
  } = useChannelDetails(currentChannel?.id || null);

  const {
    dataChannel: secondaryChannelData,
    isLoading: isLoadingSecondaryChannel,
    error: errorSecondaryChannel
  } = useChannelDetails(secondaryChannel?.id || null, 120, true);

  const {
    selectedUser,
    fetchUserById,
    isLoading: isLoadingUser,
    error: errorUser
  } = useUsersStore();

  const {
    selectedLocation,
    fetchLocationById,
    loadingStates: { fetchLocation: isLoadingLocation },
    error: errorLocation
  } = useLocationsStore();

  // Cargar usuario y ubicación
  React.useEffect(() => {
    if (userId) {
      fetchUserById(userId);
    }
    if (locationId) {
      fetchLocationById(locationId);
    }
  }, [userId, locationId]);

  // Actualizar alarma después de archivar/desarchivar
  React.useEffect(() => {
    if (!modalArchiveOpen && currentAlarm?.id) {
      const timeout = setTimeout(() => {
        refreshAlarm();
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [modalArchiveOpen, currentAlarm?.id]);

  const isLoading = isLoadingAlarm || isLoadingUser || isLoadingLocation || 
                   isLoadingPrimaryChannel || 
                   (secondaryChannel && isLoadingSecondaryChannel);

  if (isLoading) {
    return <LoadingSpinner message="Cargando detalles de la alarma..." />;
  }

  const error = errorAlarm || errorUser || errorLocation || 
                errorPrimaryChannel || 
                (secondaryChannel && errorSecondaryChannel);

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  if (!currentAlarm) {
    return <div className={styles.error}>Alarma no encontrada</div>;
  }

  // Preparar los datos para el gráfico digital
  const prepareDigitalData = (data, channelName) => {
    if (!data || !data.length) return [];
    return data.map(point => ({
      timestamp: point.fecha,
      porcentaje_encendido: parseFloat(point.porcentaje_encendido),
      failure: point.tiempo_total >= 900, // 15 minutos en segundos
      channelName
    }));
  };

  // Preparar los datos para el gráfico analógico
  const prepareAnalogData = (data, channelName, multiplicador = 1) => {
    if (!data || !data.length) return [];
    return data.map(point => ({
      timestamp: point.fecha,
      value: parseFloat(point.valor) * multiplicador,
      channelName
    }));
  };

  const renderChart = () => {
    if (!primaryChannelData || primaryChannelData.length === 0) {
      return <p className={styles.noData}>No hay datos disponibles</p>;
    }

    const isDigital = currentChannel?.nombre_columna.startsWith('d');
    const isAnalog = currentChannel?.nombre_columna.startsWith('a');

    if (isDigital) {
      const primaryData = prepareDigitalData(primaryChannelData, currentChannel?.nombre);
      const secondaryData = secondaryChannel && secondaryChannelData ? 
        prepareDigitalData(secondaryChannelData, secondaryChannel?.nombre) : [];

      if (currentAlarm.tipo_alarma === 'FUNCIONAMIENTO_SIMULTANEO' && secondaryData.length > 0) {
        return (
          <TimeSeriesChart
            dataSets={[primaryData, secondaryData]}
            series={[
              {
                name: currentChannel?.nombre,
                field: 'porcentaje_encendido',
                color: '#2196F3'
              },
              {
                name: secondaryChannel?.nombre,
                field: 'porcentaje_encendido',
                color: '#FF9800'
              }
            ]}
            customTimeRanges={customTimeRanges}
            yAxisTitle="Porcentaje de Encendido (%)"
            showFailureMarkers={true}
            enableZoom={true}
          />
        );
      } else {
        return (
          <DigitalPorcentageOn
            data={primaryData}
            currentChannelName={currentChannel?.nombre}
            currentChannelTimeProm={currentChannel?.tiempo_a_promediar}
            customTimeRanges={customTimeRanges}
          />
        );
      }
    } else if (isAnalog) {
      const primaryData = prepareAnalogData(primaryChannelData, currentChannel?.nombre, currentChannel?.multiplicador);
      const secondaryData = secondaryChannel && secondaryChannelData ? 
        prepareAnalogData(secondaryChannelData, secondaryChannel?.nombre, secondaryChannel?.multiplicador) : [];

      if (currentAlarm.tipo_alarma === 'FUNCIONAMIENTO_SIMULTANEO' && secondaryData.length > 0) {
        return (
          <TimeSeriesChart
            dataSets={[primaryData, secondaryData]}
            series={[
              {
                name: currentChannel?.nombre,
                field: 'value',
                color: '#2196F3'
              },
              {
                name: secondaryChannel?.nombre,
                field: 'value',
                color: '#FF9800'
              }
            ]}
            customTimeRanges={customTimeRanges}
            yAxisTitle={currentChannel?.unidad || 'Valor'}
            showFailureMarkers={false}
            enableZoom={true}
          />
        );
      } else {
        return (
          <AnalogData
            data={primaryChannelData}
            mult={currentChannel?.multiplicador}
          />
        );
      }
    }

    return <p className={styles.noData}>Tipo de canal no soportado</p>;
  };

  const handleOpenLogModal = (log) => {
    setSelectedLog(log);
    setModalLogOpen(true);
  };

  const handleCloseLogModal = () => {
    setModalLogOpen(false);
    setSelectedLog(null);
  };

  const alarmButtons = (
    currentAlarm?.estado == '1' ?
    (<>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`${location.pathname}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        onClick={() => setModalArchiveOpen(true)}
      />
    </>) :
    (<>
      <BtnCallToAction
        text="Desarchivar"
        icon="save-regular.svg"
        onClick={() => setModalArchiveOpen(true)}
      />
      <BtnCallToAction
        text="Eliminar"
        icon="trash-alt-regular.svg"
        type="danger"
        url={`/panel/alarmas/${currentAlarm.id}/eliminar`}
      />
    </>)
  );

  const columns = [
    { label: 'DIA Y HORA DEL EVENTO', accessor: 'fecha', icon: '/icons/clock-regular.svg' },
    { label: 'EVENTO', accessor: 'evento', icon: '/icons/flag-regular.svg' },
    { label: 'MENSAJE', accessor: 'mensaje', icon: '/icons/envelope-regular.svg' },
    { label: 'USUARIOS NOTIFICADOS', accessor: 'usuarios', icon: '/icons/user-regular.svg' }
  ];

  const eventosMap = new Map();

  alarmLogs.forEach(log => {
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
          email: log.email
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

  const preparedLogs = Array.from(eventosMap.values());

  console.log(currentChannel)

  return (
    <>
      <ModalSetArchive
        isOpen={modalArchiveOpen}
        onRequestClose={() => setModalArchiveOpen(false)}
        entidad="alarma"
        entidadId={currentAlarm?.id}
        nuevoEstado={currentAlarm?.estado == '1' ? '0' : '1'}
        redirectTo="#"
        nombre={`${currentAlarm?.nombre}`}
      />
      {selectedLog && (
        <ModalViewAlarmLog
          isOpen={modalLogOpen}
          onRequestClose={handleCloseLogModal}
          evento={selectedLog}
        />
      )}

      <Title1
        type="alarmas"
        text={`Alarma: ${currentAlarm?.nombre}`}
      />
      <Breadcrumb
        usuario={`${selectedUser?.nombre_1} ${selectedUser?.apellido_1}`}
        ubicacion={selectedLocation?.nombre}
        datalogger={currentDatalogger?.nombre}
        canal={(currentChannel?.nombre) ? currentChannel?.nombre : currentChannel?.canales_nombre}
        alarma={currentAlarm.nombre}
      />
      <CardImage
        image="/images/default_channel.png"
        title={currentAlarm.nombre}
        buttons={alarmButtons}
      >
        <div className={styles.alarmInfo}>
          {currentAlarm?.estado == '0' && (
            <CustomTag text="Archivada" type="archive" icon="/icons/archive-solid.svg" />
          )}
          <p><strong>Condición:</strong> {currentAlarm.condicion_mostrar}</p>
          <p><strong>Tipo de Alarma:</strong> {currentAlarm.tipo_alarma}</p>
          <p><strong>Descripción:</strong> {currentAlarm.descripcion}</p>
          <div className={styles.gaugePlaceholder}>              
                {currentAlarm?.tipo_alarma == "PORCENTAJE_ENCENDIDO" && (() => {
                  const conditionOperator = currentAlarm.condicion.split(" ")[1];
                  const conditionValue = currentAlarm.variable01;  
                  const max = (conditionOperator.includes(">")) ? conditionValue : 100;
                  const min = (conditionOperator.includes("<")) ? conditionValue : 0;
                  const preparedData = prepareDigitalData(primaryChannelData);
                  const lastData = parseFloat(preparedData[preparedData.length - 1]?.porcentaje_encendido, 2);
                  //console.log(lastData)
                  return (
                    <Gauge 
                      currentValue={lastData}
                      alarmMin={min}
                      alarmMax={max}                              
                    />
                  );
                })()}
              </div>

          <p><strong>Canales monitoreados:</strong> <br/>
            <CardBtnSmall 
              title={currentChannel?.nombre || 'Canal principal'} 
              url={`/panel/dataloggers/${currentDatalogger?.id}/canales/${currentChannel?.id}`} 
            />
            {currentAlarm.tipo_alarma === 'FUNCIONAMIENTO_SIMULTANEO' && secondaryChannel && (
              <CardBtnSmall 
                title={secondaryChannel.nombre || 'Canal secundario'} 
                url={`/panel/dataloggers/${currentDatalogger?.id}/canales/${secondaryChannel.id}`} 
              />
            )}
          </p>

          <p><strong>Fecha de creación:</strong> {new Date(currentAlarm.fecha_creacion).toLocaleDateString()}</p>
        </div>
      </CardImage>

      <div className={styles.chartContainer}>
        {renderChart()}
      </div>

      <Title2 type="historial" text={`Historial de disparos para alarma ${currentAlarm.nombre}`} />
      
      {isLoading ? (
        <LoadingSpinner message="Cargando historial de alarmas..." />
      ) : error ? (
        <div className={styles.error}>{error}</div>
      ) : alarmLogs.length === 0 ? (
        <div className={styles.noData}>No hay registros de disparos para esta alarma</div>
      ) : (
        <div className={styles.tableContainer}>
          <Table
            columns={columns}
            data={preparedLogs}
            onRowClick={(row) => handleOpenLogModal(row)}
          />
        </div>
      )}
    </>
  );
};

export default ViewAlarm;
