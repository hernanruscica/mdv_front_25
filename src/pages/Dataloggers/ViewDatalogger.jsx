import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import Table from '../../components/Table/Table';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import { useDataloggerDetails } from '../../hooks/useDataloggerDetails';

const ViewDatalogger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  
  const {
    currentDatalogger,
    dataloggerChannels,
    dataloggerAlarms,
    location,
    isLoading,
    error,
    channelCounts,
    refreshDatalogger
  } = useDataloggerDetails(parseInt(id));

  // Efecto para actualizar el datalogger después de cerrar el modal
  React.useEffect(() => {
    if (!modalOpen && currentDatalogger?.id) {
      const timeout = setTimeout(() => {
        refreshDatalogger();
      }, 200);
      return () => clearTimeout(timeout);
    }
  }, [modalOpen, currentDatalogger?.id]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error || !currentDatalogger) {
    return <div className={styles.error}>Error: {error || 'Datalogger no encontrado'}</div>;
  }

  const dataloggerButtons = currentDatalogger.estado == '1' ? (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/dataloggers/${currentDatalogger.id}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        onClick={() => setModalOpen(true)}
      />
    </>
  ) : (
    <>
      <BtnCallToAction
        text="Desarchivar"
        icon="save-regular.svg"
        onClick={() => setModalOpen(true)}
      />
      <BtnCallToAction
        text="Eliminar"
        icon="trash-alt-regular.svg"
        type="danger"
        url={`/panel/dataloggers/${currentDatalogger.id}/eliminar`}
      />
    </>
  );

  const columns = [
    { label: 'NOMBRE DE LA ALARMA', accessor: 'nombreAlarma' },
    //{ label: 'NOMBRE DEL CANAL', accessor: 'nombreCanal' },
    { label: 'CONDICIÓN', accessor: 'condicion_mostrar' },
    { label: 'ESTADO', accessor: 'estado' },
  ];

  const handleAlarmClick = (row) => {
    navigate(`/panel/dataloggers/${currentDatalogger.id}/canales/${row.canalId}/alarmas/${row.id}`);
  };

  const preparedAlarms = dataloggerAlarms.map(alarm => ({
    nombreAlarma: alarm.nombre,
    //nombreCanal: alarm.canal_nombre,
    condicion_mostrar: alarm.condicion_mostrar || 'Sin condición',
    canalId: alarm.canal_id,
    estado: alarm.estado,
    id: alarm.id
  }));

  return (
    <>
      <ModalSetArchive
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        entidad="datalogger"
        entidadId={currentDatalogger.id}
        nuevoEstado={currentDatalogger.estado == '1' ? 0 : 1}
        redirectTo={`/panel/dataloggers/${currentDatalogger.id}`}
        nombre={currentDatalogger.nombre}
      />
      
      <Title1 
        type="dataloggers"
        text={currentDatalogger.nombre}
      />
      
      <Breadcrumb datalogger={currentDatalogger.nombre}/>
      
      <CardImage
        image={currentDatalogger.foto ? `${import.meta.env.VITE_IMAGE_URL}/${currentDatalogger.foto}` : '/images/default-datalogger.webp'}
        title={currentDatalogger.nombre}
        buttons={user.espropietario == 1 ? dataloggerButtons : null}
      >
        <div className={styles.dataloggerInfo}>
          {currentDatalogger.estado == '0' && (
            <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
          )}
          <p className={styles.description}>{currentDatalogger.descripcion}</p>
          <p><strong>MAC:</strong> {currentDatalogger.direccion_mac}</p>
          <p>
            <strong>Ubicación:</strong> {
              location ? (
                <CardBtnSmall
                  title={location.ubicaciones_nombre}
                  url={`/panel/ubicaciones/${location.ubicaciones_id}`}
                />
              ) : 'No especificada'
            }
          </p>
          <p><strong>Creado el:</strong> {new Date(currentDatalogger.fecha_creacion).toLocaleDateString()}</p>
          <p>
            <strong>Canales conectados:</strong>{" "}
            {channelCounts.analog} analógicos y {channelCounts.digital} digitales
          </p>
          <p>
            <strong>Alarmas programadas:</strong>{" "}
            {dataloggerAlarms.length > 0 ? (
              <CardBtnSmall
                title={`Ver ${dataloggerAlarms.filter(alarm => alarm.estado == '1').length} alarmas activas`}
                url={`/panel/dataloggers/${currentDatalogger.id}/alarmas`}
              />
            ) : 'No hay alarmas programadas'
            }
          </p>
        </div>
      </CardImage>

      <Title2 
        text={`Canales del datalogger ${currentDatalogger.nombre}`}
        type="canales"
      />      
      
      {dataloggerChannels.length > 0 ? (
        <ShowChannelsCards
          channels={dataloggerChannels}
          alarms={dataloggerAlarms}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={user.espropietario == '1'}
        />
      ) : 'No hay canales todavía'}

      <Title2 
        text={`Alarmas programadas en ${currentDatalogger.nombre}`}
        type="alarmas"
      />
      {(user.espropietario == 1 || user.esadministrador) && (
        <BtnCallToAction
          text="Agregar alarma"
          icon="plus-circle-solid.svg"
          type="normal"
          url={`/panel/dataloggers/${currentDatalogger.id}/alarmas/agregar`}
        />
      )}
      {preparedAlarms.length > 0 ? (
        
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedAlarms}
            onRowClick={handleAlarmClick}
            showAddButton={user.espropietario == 1 || user.esadministrador == true}
          />
        </div>
      ) : (
        <p className={styles.description}>
          Este datalogger todavía no tiene alarmas, para agregar una primero tiene que elegir un canal.
        </p>
      )}
    </>
  );
};

export default ViewDatalogger;