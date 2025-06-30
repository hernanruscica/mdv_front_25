import React, { useState, useEffect } from 'react';
import { useParams, useLocation} from 'react-router-dom';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useAlarmLogsStore } from '../../store/alarmLogsStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
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


const ViewAlarm = () => {
  const { alarmId, userId, locationId } = useParams();
  const [currentAlarm, setCurrentAlarm] = useState(null);
  const [alarmLogs, setAlarmLogs] = useState([]);
  const [currentChannel, setCurrentChannel] = useState(null);
  const [currentDatalogger, setCurrentDatalogger] = useState(null);
  const location = useLocation();
  const [modalArchiveOpen, setModalArchiveOpen] = useState(false);
  const [modalLogOpen, setModalLogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  const { 
    fetchAlarmById,
    loadingStates: { fetchAlarm: isLoading },
    error 
  } = useAlarmsStore();

  const { 
    fetchAlarmLogsByAlarmId,
    loadingStates: { fetchAlarmLogs: isLoadingLogs },
    error: errorLogs 
  } = useAlarmLogsStore();

  const {
    channels, selectedChannel,
    fetchChannelById,
    loadingStates: { fetchChannel: isLoadingChannel },
    error: errorChannel
  } = useChannelsStore();

  const {
    dataloggers, selectedDatalogger,
    fetchDataloggerById,
    loadingStates: { fetchChannel: isLoadingDatalogger },
    error: errorDatalogger
  } = useDataloggersStore();

  const {
    selectedUser,
    fetchUserById,
    isLoading: isLoadingUser ,
    error: errorUser
  } = useUsersStore();

  const {
    selectedLocation,
    fetchLocationById,
    loadingStates: { fetchLocation: isLoadingLocation },
    error: errorLocation
  } = useLocationsStore();

  const [modalUsuariosOpen, setModalUsuariosOpen] = useState(false); 

  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);



  useEffect(() => {
    const loadAlarm = async () => {
      const alarm = await fetchAlarmById(alarmId);
      setCurrentAlarm(alarm);
    };

    if (alarmId) {
      loadAlarm();
    }
  }, [alarmId]);

  useEffect(() => {    
   const loadUser = async () => {
      await fetchUserById(userId);   
    };
  if (userId) {  
    loadUser();
  }
      
  }, [userId] )

  useEffect(() => {    
    const loadLocation = async () => {
       await fetchLocationById(locationId);   
     };
    if (locationId) {  
      loadLocation();
    }
       
   }, [locationId] )

  useEffect(() => {
    const loadChannelAndLogs = async () => {
      if (currentAlarm) {
        // Primero cargamos los logs
        const logs = await fetchAlarmLogsByAlarmId(currentAlarm.id);
        setAlarmLogs(logs || []);

        // Luego buscamos el canal
        const channelFromStore = channels.find(c => c.canales_id === currentAlarm.canal_id);
        if (channelFromStore) {
          setCurrentChannel(channelFromStore);
        } else {
          try {
            const fetchedChannel = await fetchChannelById(currentAlarm.canal_id);
            setCurrentChannel(fetchedChannel);
          } catch (error) {
            console.error('Error al cargar el canal:', error);
          }
        }
      }
    };
    
    loadChannelAndLogs();
  }, [currentAlarm, channels]);

  useEffect(() => {
    const loadDatalogger = async () => {
      if (currentChannel?.datalogger_id) {
        const dataloggerFromStore = dataloggers.find(d => d.id === currentChannel.datalogger_id);
        if (dataloggerFromStore) {
          setCurrentDatalogger(dataloggerFromStore);
        } else {
          try {
            const fetchedDatalogger = await fetchDataloggerById(currentChannel.datalogger_id);
            setCurrentDatalogger(fetchedDatalogger);
          } catch (error) {
            console.error('Error al cargar el datalogger:', error);
          }
        }
      }
    };

    loadDatalogger();
  }, [currentChannel, dataloggers]);

    useEffect(() => {
      if (!modalArchiveOpen && currentAlarm?.id) {        
        const timeout = setTimeout(() => {
          fetchAlarmById(currentAlarm.id).then(setCurrentAlarm);             
          //console.log('Actualizando los usuarios a mostrar en ViewUser.jsx');     
        }, 400);
        return () => clearTimeout(timeout);
      }
    }, [modalArchiveOpen, fetchAlarmById, currentAlarm?.id]); 

   

  if (isLoading || isLoadingLogs || isLoadingChannel || isLoadingDatalogger || isLoadingUser || isLoadingLocation) {
    return <LoadingSpinner message="Cargando detalles de la alarma..." />;
  }

  if (error || errorLogs || errorChannel || errorDatalogger) {
    return <div className={styles.error}>
      {error || errorLogs || errorChannel || errorDatalogger}
    </div>;
  }

  if (!currentAlarm) {
    return <div className={styles.error}>Alarma no encontrada</div>;
  }

  const handleOpenLogModal = (log) => {
    setSelectedLog(log);
    setModalLogOpen(true);
  };

  const handleCloseLogModal = () => {
    setModalLogOpen(false);
    setSelectedLog(null);
  };

  const alarmButtons = (
    (currentAlarm?.estado == '1') ?
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
    </>):
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


  // Convertir el Map a un array final
  const preparedLogs = Array.from(eventosMap.values());



  //console.log(preparedLogs[0]);

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
          {
            currentAlarm?.estado == '0' &&
            (<CustomTag text="Archivada" type="archive" icon="/icons/archive-solid.svg" />)
            }
          {/* <p><strong>Nombre:</strong> {currentAlarm.nombre}</p> */}
          <p><strong>Condición:</strong> {currentAlarm.condicion_mostrar}</p>
          {/* <p><strong>Estado:</strong> {currentAlarm.estado ? 'Activa' : 'Inactiva'}</p> */}
          <p><strong>Tipo de Alarma:</strong> {currentAlarm.tipo_alarma}</p>
          <p><strong>Descripción:</strong> {currentAlarm.descripcion}</p>
          <p><strong>Fecha de creación:</strong> {new Date(currentAlarm.fecha_creacion).toLocaleDateString()}</p>
        </div>
      </CardImage>
      <Title2 type="historial" text={`Historial de disparos para alarma ${currentAlarm.nombre}`} />
      
      {isLoadingLogs ? (
        <LoadingSpinner message="Cargando historial de alarmas..." />
      ) : errorLogs ? (
        <div className={styles.error}>{errorLogs}</div>
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