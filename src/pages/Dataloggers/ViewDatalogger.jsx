import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom'; // Unificado Link aquí
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
// import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardImage from '../../components/CardImage/CardImage';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ViewDatalogger.module.css';
import ShowChannelsCards from '../../components/ShowChannelsCards/ShowChannelsCards';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';
import { useFetchDatalogger } from '../../hooks/useFetchDatalogger';
import { useDataStore } from '../../store/dataStore';
//import GaugeLinear from '../../components/GaugeLinear/GaugeLinear';
import AlarmLinkCard from '../../components/AlarmLinkCard/AlarmLinkCard';

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

  useEffect(() => {
    const loadDataloggerUsage = async () => {       
      if (dataloggerId && businessUuid) {
        await fetchDataloggerUsage(businessUuid, dataloggerId);
      }
    };
    loadDataloggerUsage();
  }, [dataloggerId, businessUuid]);  

  if (isLoadingDatalogger || isCreatingDatalogger || isUpdattingDatalogger || isLoadingDataloggerUsage) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

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
     
      <div className={styles.sectionRow}>
        {(dataloggerUsage) ? (
        <div className={styles.gaugeContainer}>
          <Title2 text="Datos en tiempo real" type='alarmas'/>
          <div className={styles.cardsContainer}>
            {datalogger?.alarms && datalogger?.alarms.length > 0 && (
              datalogger?.alarms.map((alarm, index) => { 
                if (alarm.is_active !== 1) return null;
                if (alarm.alarm_type !== 'porcentage_on') return null;
                const currentChannel = dataloggerUsage?.channels.find(ch => ch.uuid == alarm?.channel_uuid);
                const currentValue =  currentChannel?.lastData?.porcentageUsagePeriod || '--';                
                
                let currentMin = null;                 
                let currentMax = null;
                if (alarm?.condition_logic.includes('>')){
                  currentMin = 0;
                  currentMax = alarm?.var01;
                }else{
                  currentMin = alarm?.var01;
                  currentMax = 100
                }
                return (                  
                  <AlarmLinkCard 
                    to={`/panel/ubicaciones/${alarm.business_uuid}/dataloggers/${alarm.datalogger_uuid}/canales/${alarm.channel_uuid}/alarmas/${alarm.uuid}`} 
                    alarm={alarm}
                    currentValue={currentValue}
                    currentMin={currentMin} 
                    currentMax={currentMax}               
                    >                         
                    {/* <GaugeLinear currentValue={currentValue} alarmMin={currentMin} alarmMax={currentMax} /> */}
                  </AlarmLinkCard>                                   
                );
              })
            )}
          </div>
        </div>
        ):
        (<p>No hay datos de uso del datalogger. Actualice en unos minutos.</p>)
        }
        <CardImage
          image={datalogger?.img ? `${datalogger?.img}` : '/images/default_datalogger.webp'}
          title={datalogger?.name}
          buttons={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator' ? dataloggerButtons : null}
        >
          <div className={styles.dataloggerInfo}>
            {datalogger?.is_active == '0' && (
              <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
            )}
            <p className={styles.description}>{datalogger?.description}</p>
            <p className={styles.highLightText}>
              <strong>Últimos datos recibidos:</strong> 
              {dataloggerUsage?.lastConection 
                  ? FormatearFechaCompleta(dataloggerUsage?.lastConection) 
                  : 'Sin datos aún'}
            </p>
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
          </div>
        </CardImage>
      </div>
 
      <Title2 
        text={`Canales del datalogger ${datalogger?.name}`}
        type="canales"
      />      
      
      {datalogger?.channels.length > 0 ? (
        <ShowChannelsCards
          channels={datalogger ? datalogger?.channels : []}
          alarms={datalogger?.alarms}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
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