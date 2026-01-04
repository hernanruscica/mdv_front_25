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
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

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

  useEffect(() => {
    const loadLocation = async () => {
      const currentLocation = await fetchLocationById(businessUuid);
      setAlarmsQuantity(currentLocation?.dataloggers.reduce((sum, dl) => sum + dl.alarms.length, 0));
      const allAlarms = currentLocation?.dataloggers.flatMap(dl => dl.alarms) || [];      
      setAllAlarms(allAlarms);
    };
    loadLocation();
  }, [businessUuid, isUpdattingLocation]);  

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
{/* 
        <BtnCallToAction
          text="Eliminar"
          icon="trash-alt-regular.svg"
          type="danger"
          url={`/panel/ubicaciones/${selectedLocation?.uuid}/eliminar`}
        />
         */}
      </>)  
      }

    </>
  ); 
  const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;
  //console.log(selectedLocation);
  
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
       {
              userCurrentRole == 'Owner'
              ? <>
                <p className={styles.description}>
                  Como propietario, usted tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
                  En esta pagina puede: <strong> Agregar nuevos dataloggers, editar y/o archivar la ubicacion</strong> actual. <br/><br/>
                  Tambien puede <strong>ver los usuarios</strong> asociados a esta ubicacion y <strong>las alarmas activas.</strong> <br/><br/>
                  Una ubicacion puede tener varios dataloggers y cada datalogger, varios canales y alarmas asociados.<br/><br/>
                  Puede buscar un datalogger, ver u ocultar los archivados segun sea necesario.
                </p>          
              </>
              : <p className={styles.description}>
                  Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
                </p>
            }
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
          <p><strong>Fecha de creación:</strong> {selectedLocation?.created_at ? FormatearFechaCompleta(selectedLocation?.created_at) : 'No disponible'}</p>

         
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
          <p><strong>Usuarios asociados:</strong>{" "}
            <CardBtnSmall 
              title={`Ver usuarios de ${selectedLocation?.name}`}
              url={`/panel/ubicaciones/${selectedLocation?.uuid}/usuarios`}
            />            
          </p>           
        </div>
      </CardImage>

      <Title2 text={`Dataloggers en ${selectedLocation?.name}`} type="dataloggers"/>                   
      {(selectedLocation?.dataloggers.length > 0) ?
        <ShowDataloggersCards
          dataloggers = {selectedLocation?.dataloggers}
          searchTerm = {searchTerm}
          onSearchChange = {setSearchTerm}
          showAddButton={userCurrentRole === 'Owner'}
        /> :
       (userCurrentRole === 'Owner') && ( <>
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