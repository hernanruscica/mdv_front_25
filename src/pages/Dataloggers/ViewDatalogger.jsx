import { useState, useEffect, use } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import Table from '../../components/Table/Table';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import {useFetchDatalogger} from '../../hooks/useFetchDatalogger';


const ViewDatalogger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  
  const { businessUuid, uuid } = useParams();
  
  const user = useAuthStore(state => state.user);    
  const { datalogger, isLoadingDatalogger, errorDatalogger } = useFetchDatalogger(uuid, businessUuid);  
  

  if (isLoadingDatalogger) {
    return <LoadingSpinner message="Cargando datos..." />;
  }


  const userCurrentRole = 
    user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

    //console.log('datalogger', selectedDatalogger);

  // // Efecto para actualizar el datalogger después de cerrar el modal
  // useEffect(() => {
  //   if (!modalOpen && currentDatalogger?.id) {
  //     const timeout = setTimeout(() => {
  //       refreshDatalogger();
  //     }, 200);
  //     return () => clearTimeout(timeout);
  //   }
  // }, [modalOpen, currentDatalogger?.id]);
/*
  if (isLoading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error || !currentDatalogger) {
    return <div className={styles.error}>Error: {error || 'Datalogger no encontrado'}</div>;
  }

  

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
*/



const dataloggerButtons = datalogger?.is_active == '1' ? (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${datalogger?.uuid}/editar`}
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
        url={`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${datalogger?.uuid}/eliminar`}
      />
    </>
  );

  return (
    <>
      <Title1 
        type="dataloggers"
        text={datalogger?.name}
      />
      <Breadcrumb datalogger={datalogger?.name} ubicacion={datalogger?.business.name}/>     
     
      
      <CardImage
        image={datalogger?.img ? `${import.meta.env.VITE_IMAGE_URL}/${datalogger?.img}` : '/images/default-datalogger.webp'}
        title={datalogger?.name}
        buttons={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator' ? dataloggerButtons : null}
      >
        <div className={styles.dataloggerInfo}>
          {datalogger?.is_active == '0' && (
            <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
          )}
          <p className={styles.description}>{datalogger?.description}</p>
          <p><strong>MAC:</strong> {datalogger?.mac_address}</p>
          <p>
            <strong>Ubicación:</strong> {
              location ? (
                <CardBtnSmall
                  title={datalogger?.business.name}
                  url={`/panel/ubicaciones/${datalogger?.business.uuid}`}
                />
              ) : 'No especificada'
            }
          </p>
          <p><strong>Creado el:</strong> {new Date(datalogger?.created_at).toLocaleDateString()}</p>
          <p>
            <strong>Canales conectados:</strong>{" "}
            {datalogger?.channels.filter(ch=>ch.column_name[0] == 'a').length} analógicos 
            y {datalogger?.channels.filter(ch=>ch.column_name[0] == 'd').length} digitales
          </p>
          <p>
            <strong>Alarmas programadas:</strong>{" "}
            {datalogger?.alarms.length > 0 ? (
              <CardBtnSmall
                title={`Ver ${datalogger?.alarms.filter(alarm => alarm.is_active == '1').length} alarmas activas`}
                url={`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${datalogger?.uuid}/alarmas`}
              />
            ) : 'No hay alarmas programadas'
            }
          </p>
        </div>
      </CardImage>
      
 
      <Title2 
        text={`Canales del datalogger ${datalogger?.name}`}
        type="canales"
      />      
      
      {datalogger?.channels.length > 0 ? (
        <ShowChannelsCards
          channels={datalogger?.channels}
          alarms={datalogger?.alarms}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
        />
      ) : 
      (<>
        <BtnCallToAction 
          text="Agregar canal"
          icon="plus-circle-solid.svg"
          type="normal"
          url={`/panel/ubicaciones/${businessUuid}/dataloggers/${datalogger?.uuid}/canales/agregar`}  
        />
        <p>No hay canales todavía</p>
        </>)}

     {/* 
      
      {preparedAlarms.length > 0 ? (
        <>
        <Title2 
          text={`Alarmas programadas en ${selectedDatalogger.nombre}`}
          type="alarmas"
        />
        {(user.espropietario == 1 || user.esadministrador) && (
        <BtnCallToAction
          text="Agregar alarma"
          icon="plus-circle-solid.svg"
          type="normal"
          url={`/panel/dataloggers/${selectedDatalogger.id}/alarmas/agregar`}
        />
      )}
        <div className={styles.tableContainer}>
          <Table 
            columns={columns}
            data={preparedAlarms}
            onRowClick={handleAlarmClick}
            showAddButton={user.espropietario == 1 || user.esadministrador == true}
          />
        </div>
        </>
      ) : (
        <p className={styles.description}>
          Este datalogger todavía no tiene alarmas, para agregar una primero tiene que elegir un canal.
        </p>
      )}
    </>
  );
  */}
  </>)
};

export default ViewDatalogger;