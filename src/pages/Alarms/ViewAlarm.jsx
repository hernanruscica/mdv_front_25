import { useState, useEffect, use } from 'react';
import { useParams, useLocation } from 'react-router-dom';
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
import { useAlarmLogs } from '../../hooks/useAlarmLogs';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';

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
  const { businessUuid, dataloggerId, channelId, alarmId, userId,  } = useParams();
  const location = useLocation();
  const [modalArchiveOpen, setModalArchiveOpen] = useState(false);
  const [modalLogOpen, setModalLogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const { user } = useAuthStore();  
  const { 
    selectedDatalogger, 
    fetchDataloggerById,
    loadingStates : { fetchDatalogger: isLoadingDatalogger }
   } = useDataloggersStore();

  // Hook para datos de la alarma
  const {
    currentAlarm,    
    secondaryChannel,    
    isLoading,
    errorAlarm,    
  } = useAlarmDetails(businessUuid, alarmId);
  

  // Hooks para datos de los canales
  const {
    dataChannel: primaryChannelData,
    isLoading: isLoadingPrimaryChannel,    
    currentChannel,    
    error: errorPrimaryChannel
  } = useChannelDetails(channelId || null);

  const { alarmLogs, status: {isLoading : isLoadingAlarmLogs, isError: errorAlarmLogs}, actions } = useAlarmLogs(businessUuid, alarmId);

  useEffect(() => {
    if (dataloggerId && businessUuid) {
      console.log('fetch datalogger', businessUuid, dataloggerId);
      
        fetchDataloggerById(dataloggerId, businessUuid);
      }
    }, [dataloggerId, businessUuid, fetchDataloggerById]);


  if (isLoading || isLoadingPrimaryChannel || isLoadingAlarmLogs || isLoadingDatalogger) {
    return <LoadingSpinner message="Cargando los datos..." />;
  }  

  if (errorAlarm || errorPrimaryChannel || errorAlarmLogs) {
    return <div className={styles.error}>Error cargando los datos</div>;
  }


  //console.log('selectedDatalogger', selectedDatalogger);
  

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

    const isDigital = currentChannel?.column_name.startsWith('d');
    const isAnalog = currentChannel?.column_name.startsWith('a');

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
                name: currentChannel?.name,
                field: 'porcentaje_encendido',
                color: '#2196F3'
              },
              {
                name: secondaryChannel?.name,
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
            currentChannelName={currentChannel?.name}
            currentChannelTimeProm={currentChannel?.averaging_period}
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
            mult={currentChannel?.factor}
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
    setModalLogOpen(false); // 1. Ordenar cierre visual
    
    // 2. Limpiar datos SOLO después de que termine la animación (300ms es el default usual)
    setTimeout(() => {
      setSelectedLog(null);
    }, 300);
  };

  const alarmButtons = (
    currentAlarm?.is_active == '1' ?
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
    if (!eventosMap.has(log.uuid)) {
      eventosMap.set(log.uuid, {
        fecha: new Date(log.triggered_at).toLocaleString(),
        fecha_vista: new Date(log.seen_at).toLocaleString(),
        evento: log.triggered == 0 ? 'Reset' : 'Disparo',
        id: log.uuid,
        mensaje: log.message,
        usuarios: 1,
        usuarios_afectados: [{
          nombre: log.user.first_name,
          apellido: log.user.last_name,
          email: log.user.email
        }]
      });
    } else {
      const evento = eventosMap.get(log.id);
      evento.usuarios += 1;
      evento.usuarios_afectados.push({
        nombre: log.user.first_name,
        apellido: log.user.last_name,
        email: log.user.email,
        vista: (log.seen_at == '2024-01-01T03:00:00.000Z') ? false : true,
      });
    }
  });
/**/
  const preparedLogs = Array.from(eventosMap.values()); 

   const userCurrentRole = user?.businesses_roles.some(br => br.role === 'Owner')
         ? 'Owner'
         : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role


//  console.log('datalogger_id', currentChannel.datalogger_id);
  //console.log('currentAlarm', currentAlarm);
  
  

  return (
    <>
      <ModalSetArchive
        isOpen={modalArchiveOpen}
        onRequestClose={() => setModalArchiveOpen(false)}
        entidad="alarma"
        entidadId={currentAlarm?.uuid}
        nuevoEstado={currentAlarm?.is_active == '1' ? '0' : '1'}
        // redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/`}
        redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/${alarmId}`}
        nombre={`${currentAlarm?.name}`}
      />
     
      <ModalViewAlarmLog          
        isOpen={modalLogOpen}
        onRequestClose={handleCloseLogModal}
        evento={selectedLog}
        businessUuid={businessUuid}
      />
      


      <Title1
        type="alarmas"
        text={`Alarma: ${currentAlarm?.name}`}
      />
       {
          userCurrentRole == 'Owner'
          ? <>
            
              <p className={styles.description}>
              Usted se encuentra en la pagina para ver mas detalles de la alarma seleccionada.<br/><br/>
              Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
              En esta pagina puede: 
              </p>
              <ul  className={styles.list}>
                <li><strong>Editar y/o archivar la alarma</strong> actual.</li>
                <li><strong>Ver el gráfico</strong> del canal asociado a la alarma.</li>
                <li><strong>Ver el historial de disparos</strong> de la misma.</li>
                <li><strong>Agregar una solución</strong> para un disparo de alarma</li>
              </ul>              <br/><br/>
            <p   className={styles.description}>
              Un datalogger puede tener varios canales, y un canal puede tener varias alarmas asociadas.<br/><br/>
              Puede buscar un disparo en el historial. Cuando lo encuentra, puede hacer click en el mismo para ver más detalles. 
              Quienes recivieron la notificación del disparo estarán listados allí. y si vieron o no la notificación.
            </p>          
          </>
          : <p className={styles.description}>
            Usted se encuentra en la pagina de detalles de la alarma seleccionada.<br/><br/>
              Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.<br/><br/>
               En esta pagina puede: 
              <ul>                
                <li><strong>Ver el gráfico</strong> del canal asociado a la alarma.</li>
                <li><strong>Ver el historial de disparos</strong> de la misma.</li>
                <li><strong>Agregar una solución</strong> para un disparo de alarma</li>
              </ul>              <br/><br/>
              Un datalogger puede tener varios canales, y un canal puede tener varias alarmas asociadas.<br/><br/>
              Puede buscar un disparo en el historial. Cuando lo encuentra, puede hacer click en el mismo para ver más detalles. 
              Quienes recivieron la notificación del disparo estarán listados allí. y si vieron o no la notificación.
            </p>
        }
      <Breadcrumb
        // usuario={`${selectedUser?.nombre_1} ${selectedUser?.apellido_1}`}
        ubicacion={currentAlarm?.business?.name}
        datalogger={selectedDatalogger?.name}
        canal={currentChannel?.name }
        alarma={currentAlarm?.name}
      />
      <CardImage
        image="/images/default_channel.png"
        title={currentAlarm?.name}
        buttons={alarmButtons}
      >
        <div className={styles.alarmInfo}>
          {currentAlarm?.is_active == '0' && (
            <CustomTag text="Archivada" type="archive" icon="/icons/archive-solid.svg" />
          )}
          <p><strong>Condición:</strong> {currentAlarm?.condition_show}</p>
          <p><strong>Tipo de Alarma:</strong> {currentAlarm?.alarm_type}</p>
          <p><strong>Descripción:</strong> {currentAlarm?.description}</p>
          <div className={styles.gaugePlaceholder}>              
               
                {currentAlarm?.alarm_type == "upper_threshold" && (() => {
                  const conditionOperator = currentAlarm.condition_logic.split(" ")[1];
                  const conditionValue = currentAlarm.var01;  
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
             {/*      */}
              </div>

          <p><strong>Canales monitoreados:</strong> <br/>
            <CardBtnSmall 
              title={currentChannel?.name || 'Canal principal'} 
              url={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${channelId}`} 
            />
            {currentAlarm?.alarm_type === 'FUNCIONAMIENTO_SIMULTANEO' && secondaryChannel && (
              <CardBtnSmall 
                title={secondaryChannel?.name || 'Canal secundario'} 
                url={`/panel/ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales/${secondaryChannel?.uuid}`} 
              />
            )}
          </p>

          <p><strong>Fecha de creación:</strong> {new Date(currentAlarm?.created_at).toLocaleDateString()}</p>
        </div>
      </CardImage>

      <div className={styles.chartContainer}>
        {/* {renderChart()} */}
      </div>

      <Title2 type="historial" text={`Historial de disparos para alarma ${currentAlarm?.name}`} />
      
      {isLoading ? (
        <LoadingSpinner message="Cargando historial de alarmas..." />
      ) : errorAlarm 
      
       ? (
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
       )
      
      }
    </>
  );
};

export default ViewAlarm;
