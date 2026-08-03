import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Unificado Link aquí
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
// import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import BtnSmall from '../../components/BtnSmall/BtnSmall';
import CardImage from '../../components/CardImage/CardImage';
// import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';
import { useFetchDatalogger } from '../../hooks/useFetchDatalogger';
import { useDataStore } from '../../store/dataStore';
import { useMaintenanceLogsStore } from '../../store/maintenanceLogsStore';
//import GaugeLinear from '../../components/GaugeLinear/GaugeLinear';

// NUEVOS IMPORTS
import { DATALOGGER_VIEW_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';


const ViewDatalogger = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { businessUuid, dataloggerId } = useParams();
  const user = useAuthStore(state => state.user);    
  
  const {
    dataloggerUsage,
    fetchDataloggerUsage,
    loadingStates: { fetchDataloggerUsage: isLoadingDataloggerUsage }
  } = useDataStore();

  const {
    maintenanceLogs,
    fetchMaintenanceLogs,
    loadingStates: { fetchMaintenanceLogs: isLoadingMaintenanceLogs }
  } = useMaintenanceLogsStore();

  const { 
    datalogger, 
    isLoadingDatalogger,
    isCreatingDatalogger, 
    isUpdattingDatalogger, 
    refreshDatalogger 
  } = useFetchDatalogger(dataloggerId, businessUuid);

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);

  // Determinamos la información para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? DATALOGGER_VIEW_INFO.Owner 
    : DATALOGGER_VIEW_INFO.General;

  // Contar tareas pendientes totales del datalogger
  // const totalPendingTasks = maintenanceLogs?.filter(log => {
  //   if (log.type !== 'task') return false;
  //   const today = new Date().toISOString().split('T')[0];
  //   return log.status === 'pending' || (log.scheduled_date && log.scheduled_date > today);
  // }).length || 0;

  // Estado del datalogger según la antigüedad de la última conexión
  const ONLINE_THRESHOLD_MINUTES = 10;
  const lastConection = dataloggerUsage?.lastConection;
  let lastDataStatus = 'unknown';
  let lastDataLabel = 'Sin datos aún';
  if (lastConection) {
    const lastDate = new Date(lastConection);
    if (!isNaN(lastDate.getTime())) {
      const diffMinutes = (Date.now() - lastDate.getTime()) / 60000;
      if (diffMinutes <= ONLINE_THRESHOLD_MINUTES) {
        lastDataStatus = 'online';
        lastDataLabel = 'En línea';
      } else {
        lastDataStatus = 'offline';
        lastDataLabel = 'Sin conexión';
      }
    }
  }

  useEffect(() => {
    const loadDataloggerUsage = async () => {       
      if (dataloggerId && businessUuid) {
        await fetchDataloggerUsage(businessUuid, dataloggerId);
      }
    };
    loadDataloggerUsage();
  }, [dataloggerId, businessUuid]);

  useEffect(() => {
    if (businessUuid && dataloggerId) {
      fetchMaintenanceLogs(businessUuid, dataloggerId);
    }
  }, [businessUuid, dataloggerId]);  

  if (isLoadingDatalogger || isCreatingDatalogger || isUpdattingDatalogger || isLoadingDataloggerUsage) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  const dataloggerButtons = datalogger?.is_active == '1' ? (
    <>
      <BtnSmall
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/ubicaciones/${datalogger?.business.uuid}/dataloggers/${datalogger?.uuid}/editar`}
      />
      <BtnSmall
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        onClick={() => setModalOpen(true)}
      />
    </>
  ) : (
    <>
      <BtnSmall
        text="Desarchivar"
        icon="save-regular.svg"
        onClick={() => setModalOpen(true)}
      />
    </>
  );
 
  return (
    <>
     <ModalSetArchive
      isOpen={modalOpen}
      onRequestClose={async () => {setModalOpen(false); await refreshDatalogger();}}
      entidad="datalogger"
      entidadId={datalogger?.uuid}
      nuevoEstado={datalogger?.is_active == '1' ? 0 : 1}
      redirectTo={`/panel/ubicaciones/${datalogger?.business_uuid}/dataloggers/`}
      nombre={`${datalogger?.name}`}
      businessUuid={datalogger?.business_uuid}
    />
      <Title1 
        type="dataloggers"
        text={datalogger?.name}
      />

      {/* REEMPLAZO: Acordeón informativo centralizado */}
      <InfoAccordion data={infoData} />

      {/* <Breadcrumb datalogger={datalogger?.name} ubicacion={datalogger?.business.name}/>      */}
      <BreadcrumbAuto />
     
      <CardImage
        image={datalogger?.img ? `${datalogger?.img}` : '/images/default_datalogger.webp'}
        title={datalogger?.name}
        buttons={dataloggerButtons}
      >
        {datalogger?.is_active == '0' && (
          <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
        )}

        {/* BLOQUE DE ESTADO */}
        <div className={styles.lastDataStatus}>
          <img className={styles.lastDataIcon} src="/icons/clock-regular.svg" alt="Últimos datos" />
          <div className={styles.lastDataText}>
            <p className={styles.lastDataLabel}>Últimos datos recibidos</p>
            <span className={`${styles.statusPill} ${styles[`status_${lastDataStatus}`]}`}>
              <span className={styles.statusDot}></span>
              {lastDataLabel}
            </span>
            <p className={styles.lastDataDate}>
              {lastConection ? FormatearFechaCompleta(lastConection) : 'Aún no se recibieron datos'}
            </p>
          </div>
        </div>

        {/* DATOS ADMINISTRATIVOS (comentados: no se muestran en la card)
        <p className={styles.description}>{datalogger?.description}</p>
        <p><strong>MAC:</strong> {datalogger?.mac_address}</p>
        <p>
          <strong>Ubicación:</strong> {
            datalogger?.business ? (
              <CardBtnSmall
                title={datalogger?.business.name}
                url={`/panel/ubicaciones/${datalogger?.business.uuid}`}
              />
            ) : 'No especificada'
          }
        </p>
        <p><strong>Creado el:</strong> {FormatearFechaCompleta(datalogger?.created_at)}</p>
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
        {totalPendingTasks > 0 && (
          <div className={styles.pendingTasksBadge}>
            <img src="/icons/person-digging-solid.svg" alt="" />
            <span>{totalPendingTasks} tareas pendientes en total</span>
          </div>
        )}
        */}
      </CardImage>
 
      <Title2 
        text={`Canales del datalogger ${datalogger?.name}`}
        type="canales"
      />      
      
      {datalogger?.channels.length > 0 ? (
        <ShowChannelsCards
          channels={datalogger ? datalogger?.channels : []}
          alarms={datalogger?.alarms}
          dataloggerUsage={dataloggerUsage}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
          maintenanceLogs={maintenanceLogs}
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
    </>
  )
};

export default ViewDatalogger;