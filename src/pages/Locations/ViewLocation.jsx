import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewLocation.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import BtnSmall from '../../components/BtnSmall/BtnSmall';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

// NUEVOS IMPORTS
import { LOCATION_VIEW_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const ViewLocation = () => {
  const { businessUuid } = useParams();
  const user = useAuthStore(state => state.user);
  
  const { 
    selectedLocation,
    fetchLocationById,
    loadingStates: { fetchLocation: isLoadingLocation, updateLocation : isUpdattingLocation },    
    error: errorLocations 
  } = useLocationsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [alarmsQuantity, setAlarmsQuantity ] = useState(0);
  const [allAlarms, setAllAlarms] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);

  // Determinamos qué info mostrar en el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? LOCATION_VIEW_INFO.Owner 
    : LOCATION_VIEW_INFO.General;

  useEffect(() => {
    const loadLocation = async () => {
      const currentLocation = await fetchLocationById(businessUuid);
      if (currentLocation?.dataloggers) {
        setAlarmsQuantity(currentLocation.dataloggers.reduce((sum, dl) => sum + dl.alarms.length, 0));
        const alarms = currentLocation.dataloggers.flatMap(dl => dl.alarms) || [];      
        setAllAlarms(alarms);
      }
    };
    loadLocation();
  }, [businessUuid, isUpdattingLocation]);  

  if (isLoadingLocation && selectedLocation !== null) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorLocations ) {
    return <div className={styles.error}>Error: {errorLocations}</div>;
  }

  const locationButtons = (
    <>      
      { selectedLocation?.is_active == 1 ? (
      <>
        <BtnSmall
          text="Editar"
          icon="edit-regular.svg"
          type="warning"
          url={`/panel/ubicaciones/${selectedLocation?.uuid}/editar`}
        />  
        <BtnSmall
          text="Archivar"
          icon="archive-solid.svg"
          type="danger"
          onClick={() => setModalOpen(true)}
        />
      </>
      ) : 
      (<>
        <BtnSmall
          text="Desarchivar"
          icon="save-regular.svg"
          onClick={() => setModalOpen(true)}
        />
      </>)  
      }
    </>
  ); 
  
  return (
    <>
      <ModalSetArchive
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        entidad="ubicacion"
        entidadId={selectedLocation?.uuid}
        nuevoEstado={selectedLocation?.is_active == '1' ? 0 : 1}
        redirectTo={`/panel/ubicaciones/${selectedLocation?.uuid}`}
        nombre={`${selectedLocation?.name}`}
        businessUuid={selectedLocation?.uuid}
      />

      <Title1 
        text={`Ubicación: ${selectedLocation?.name}`}
        type="ubicaciones"
      />

      {/* REEMPLAZO: Acordeón informativo con la nueva lógica */}
      <InfoAccordion data={infoData} />

      {/* <Breadcrumb ubicacion={selectedLocation?.name}/> */}
      <BreadcrumbAuto />
      
      <CardImage
        image={selectedLocation?.logo_url !== null ? `${selectedLocation?.logo_url}` : '/images/default_location.png'}
        title={selectedLocation?.name}
        // ACTUALIZACIÓN: Verificación del nombre del rol
        buttons={userCurrentRole?.name === 'Owner' ? locationButtons : null}
      >
        <div className={styles.locationInfo}>
          {selectedLocation?.is_active == '0' && (
            <CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />
          )}

          <div className={styles.infoColumns}>
            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/folder-open-regular.svg" alt="" />
                <p><strong>Descripción:</strong> {selectedLocation?.description}</p>
              </div>
              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/home-solid.svg" alt="" />
                <p><strong>Dirección:</strong> {selectedLocation?.address.street}</p>
              </div>
              <div className={styles.infoRow}>
                <p><strong>Teléfono:</strong> {selectedLocation?.phone}</p>
              </div>
              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/envelope-regular.svg" alt="" />
                <p><strong>Email:</strong> {selectedLocation?.email}</p>
              </div>
              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/calendar-solid.svg" alt="" />
                <p><strong>Fecha de creación:</strong> {selectedLocation?.created_at ? FormatearFechaCompleta(selectedLocation?.created_at) : 'No disponible'}</p>
              </div>
            </div>

            <div className={styles.infoColumn}>
              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/microchip-solid.svg" alt="" />
                <div className={styles.infoRowContent}>
                  <p><strong>Dataloggers Asociados: {`${selectedLocation?.dataloggers?.length || 0}`}</strong></p>
                  <div className={styles.btnContainer}>
                    {!selectedLocation?.dataloggers || selectedLocation.dataloggers.length === 0 ? (
                      'No tiene'
                    ) : 
                    selectedLocation.dataloggers.map(datalogger => (
                      <CardBtnSmall
                        key={datalogger.uuid}
                        title={datalogger.name}
                        url={`/panel/ubicaciones/${selectedLocation?.uuid}/dataloggers/${datalogger.uuid}`}
                      />              
                    ))
                    }
                  </div>
                </div>
              </div>

              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/bell-regular.svg" alt="" />
                <p><strong>Alarmas Activas:</strong>{" "}
                  {alarmsQuantity === 0 ? (
                    'No hay alarmas activas'
                  ) : (
                    <CardBtnSmall 
                      title={`Ver ${alarmsQuantity} alarmas`}
                      url={`/panel/ubicaciones/${selectedLocation?.uuid}/alarmas`}
                    />
                  )}
                </p> 
              </div>
              <div className={styles.infoRow}>
                <img className={styles.infoIcon} src="/icons/user-regular.svg" alt="" />
                <p><strong>Usuarios asociados:</strong>{" "}
                  <CardBtnSmall 
                    title={`Ver usuarios de ${selectedLocation?.name}`}
                    url={`/panel/ubicaciones/${selectedLocation?.uuid}/usuarios`}
                  />            
                </p>           
              </div>
            </div>
          </div>
        </div>
      </CardImage>

      <Title2 text={`Dataloggers en ${selectedLocation?.name}`} type="dataloggers"/>                   
      
      {(selectedLocation?.dataloggers?.length > 0) ?
        <ShowDataloggersCards
          dataloggers = {selectedLocation?.dataloggers}
          searchTerm = {searchTerm}
          onSearchChange = {setSearchTerm}
          showAddButton={userCurrentRole?.name === 'Owner'}
        /> :
       (userCurrentRole?.name === 'Owner') && ( <>
          <BtnCallToAction
            text="Agregar"
            icon="plus-circle-solid.svg"
            type="normal"
            url={`/panel/ubicaciones/${businessUuid}/dataloggers/agregar`}
          />        
          <p>No hay dataloggers en esta ubicación</p>
        </>)
      }    
    </>    
  );
};

export default ViewLocation;