import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewLocation.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';

const ViewLocation = () => {
  const { businessUuid } = useParams();
  const user = useAuthStore(state => state.user);
  
  const { 
    selectedLocation,
    fetchLocationById,
    loadingStates: { fetchLocation: isLoadingLocation },    
    error: errorLocations 
  } = useLocationsStore();

  const [modalOpen, setModalOpen] = useState(false);
  const [alarmsQuantity, setAlarmsQuantity ] = useState(0);
  const [allAlarms, setAllAlarms] = useState([]);

  useEffect(() => {
    const loadLocation = async () => {
      const currentLocation = await fetchLocationById(businessUuid);
      setAlarmsQuantity(currentLocation?.dataloggers.reduce((sum, dl) => sum + dl.alarms.length, 0));
      const allAlarms = currentLocation?.dataloggers.flatMap(dl => dl.alarms) || [];      
      setAllAlarms(allAlarms);
    };
    loadLocation();
  }, [businessUuid]);  

  if (isLoadingLocation && selectedLocation !== null) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorLocations ) {
    return <div className={styles.error}>
      Error: {errorLocations }
    </div>;
  }

  const locationButtons = (
    <>      
      { selectedLocation?.is_active == 1 ? (
      <>
        <BtnCallToAction
          text="Editar"
          icon="edit-regular.svg"          
          url={`/panel/ubicaciones/${selectedLocation?.uuid}/editar`}
        />  
        <BtnCallToAction
          text="Archivar"
          icon="archive-solid.svg"
          type="danger"
          //url={`/panel/ubicaciones/${selectedLocation?.id}/archivar`}
          onClick={() => setModalOpen(true)}
        />
      </>
      ) : 
      (<>
        <BtnCallToAction
          text="Desarchivar"
          icon="save-regular.svg"          
          //url={`/panel/ubicaciones/${selectedLocation?.id}/descarchivar`}
          onClick={() => setModalOpen(true)}
        />
        <BtnCallToAction
          text="Eliminar"
          icon="trash-alt-regular.svg"
          type="danger"
          url={`/panel/ubicaciones/${selectedLocation?.uuid}/eliminar`}
        />
      </>)  
      }

    </>
  ); 
  const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;
  console.log(selectedLocation);
  
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
    />
      <Title1 
        text={`Ubicación: ${selectedLocation?.name}`}
        type="ubicaciones"
      />
      <Breadcrumb ubicacion={selectedLocation?.name}/>
      <CardImage
        image={selectedLocation?.logo_url !== null ? `${selectedLocation?.logo_url}` : '/images/default_location.png'}
        title={selectedLocation?.name}
        buttons={userCurrentRole === 'Owner' ? locationButtons : null}
      >
        <div className={styles.locationInfo}>
          {
            selectedLocation?.is_active == '0' &&
            (<CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />)
            }
          <p><strong>Descripción:</strong> {selectedLocation?.description}</p>
          <p><strong>Dirección:</strong> {selectedLocation?.address.street}</p>
          <p><strong>Teléfono:</strong> {selectedLocation?.phone}</p>
          <p><strong>Email:</strong> {selectedLocation?.email}</p>
          <p><strong>Estado:</strong> {selectedLocation?.is_active ? 'Activo' : 'Inactivo'}</p>
          <p><strong>Fecha de creación:</strong> {selectedLocation?.created_at ? new Date(selectedLocation?.created_at).toLocaleDateString() : 'No disponible'}</p>

         
          <p><strong>Dataloggers Asociados: {`${selectedLocation?.dataloggers.length}`}</strong></p>
    
          <div className={styles.btnContainer}>
            {selectedLocation?.dataloggers.length === 0 ? (
              'No tiene'
            ) : 
            selectedLocation?.dataloggers.map(datalogger => (
              <CardBtnSmall
                key={datalogger.uuid}
                title={datalogger.name}
                url={`/panel/ubicaciones/${selectedLocation?.uuid}/dataloggers/${datalogger.uuid}`}
              />              
            ))
            }
          </div>

          <p><strong>Alarmas Activas:</strong>{" "}
            {
            alarmsQuantity === 0 ? (
              'No hay alarmas activas'
            ) : (
              <CardBtnSmall 
                title={`Ver ${alarmsQuantity} alarmas`}
                url={`/panel/ubicaciones/${selectedLocation?.uuid}/alarmas`}
              />
            )          
            }
          </p>           
        </div>
      </CardImage>

      <Title2 text={`Dataloggers en ${selectedLocation?.name}`} type="dataloggers"/>            
       <BtnCallToAction
        text="Agregar datalogger"
        icon="plus-circle-solid.svg"
        type="normal"
        url={`/panel/ubicaciones/${businessUuid}/dataloggers/agregar`}
      />    
      {(selectedLocation?.dataloggers.length > 0) ?
        <ShowDataloggersCards
          dataloggers={selectedLocation?.dataloggers}
          channels={selectedLocation?.dataloggers.flatMap(d => d.channels)}
          alarms={allAlarms}
          locations={[selectedLocation]}
          showAddButton={user.isOwner == 1}
        /> :
        <p>No hay dataloggers en esta ubicación</p>
      }    
    </>    
  );
};

export default ViewLocation;