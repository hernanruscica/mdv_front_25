import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useUsersStore } from '../../store/usersStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewUser.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';

const ViewUser = () => {  
  const [searchTerm, setSearchTerm] = useState('');
  const { userId } = useParams();
  const user = useAuthStore(state => state.user);
  const { fetchUserById, fetchUsers,  isLoading: isLoadingUsers, error: errorUsers } = useUsersStore();
  const { fetchAlarmsByUser, alarms, isLoading: isLoadingAlarms, error: errorAlarms } = useAlarmsStore();
  const { fetchLocationUsers, locationUsers, isLoading : isLoadingLocations, error: errorLocationsUsers } = useLocationUsersStore();  
  const { dataloggers, isLoading: isLoadingDataloggers, fetchDataloggers, error: errorDataloggers } = useDataloggersStore();  
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {    
    const loadData = async () => {
      // Siempre obtener el usuario actualizado del servidor
      const updatedUser = await fetchUserById(userId);
      setCurrentUser(updatedUser);           
      
      if (updatedUser) {
        await Promise.all([
          fetchAlarmsByUser(updatedUser),
          fetchLocationUsers(updatedUser),
          fetchDataloggers(updatedUser)
        ]);     }   
    }  
   loadData();
  }, [userId, fetchUserById]);

  useEffect(() => {
    if (!modalOpen && currentUser?.id) {        
      const timeout = setTimeout(() => {
        fetchUserById(currentUser.id).then(setCurrentUser);   
        fetchUsers(user);
        console.log('Actualizando los usuarios a mostrar en ViewUser.jsx');     
      }, 400);
      return () => clearTimeout(timeout);
    }
  }, [modalOpen, fetchUserById, currentUser?.id]); 



  if (isLoadingUsers ||  isLoadingLocations || isLoadingDataloggers) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorUsers ||  errorLocationsUsers || errorDataloggers) {
    return <div className={styles.error}>Error: {errorUsers || errorLocationsUsers || errorDataloggers }</div>;
  }


  const userButtons = (
    currentUser?.estado == '1' ? 
    (<>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/usuarios/${currentUser?.id}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"        
        onClick={() => setModalOpen(true)}
      />
    </>):
    (<>
      <BtnCallToAction
        text="Desarchivar"
        icon="archive-solid.svg"  
        onClick={() => setModalOpen(true)}
      />
      <BtnCallToAction
        text="Eliminar"
        icon="trash-alt-regular.svg"
        type="danger"
        url={`/panel/usuarios/${currentUser?.id}/eliminar`}
      />
    </>)

  );

  const activeLocations = filterEntitiesByStatus(locationUsers);
  const activeDataloggers = filterEntitiesByStatus(dataloggers);

  //console.log('estado de usuario:',  currentUser?.estado);

  return (
    <>
    <ModalSetArchive
      isOpen={modalOpen}
      onRequestClose={() => setModalOpen(false)}
      entidad="usuario"
      entidadId={currentUser?.id}
      nuevoEstado={currentUser?.estado == '1' ? 0 : 1}
      redirectTo={`/panel/usuarios/${currentUser?.id}`}
      nombre={`${currentUser?.nombre_1} ${currentUser?.apellido_1}`}
    />
      <Title1 
        text={`Perfil de ${currentUser?.nombre_1} ${currentUser?.apellido_1}`}
        type="usuarios"
      />
      <Breadcrumb usuario={`${currentUser?.nombre_1} ${currentUser?.apellido_1}`}/>
      {currentUser && (
        <>
          <CardImage
            image={currentUser.foto ? `${import.meta.env.VITE_IMAGE_URL}/${currentUser.foto}` : '/images/default-user.png'}
            title={`${currentUser.nombre_1} ${currentUser.apellido_1}`}
            buttons={userButtons}
          >
            <div className={styles.userInfo}>
               {
                currentUser.estado == '0' &&
                (<CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />)
                }
              <p><strong>DNI:</strong> {currentUser.dni}</p>
              <p><strong>Email:</strong> {currentUser.email}</p>
              <p><strong>Teléfono:</strong> {currentUser.telefono}</p>
              <p><strong>Estado:</strong> {currentUser.estado ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Rol:</strong> {currentUser.espropietario ? 'Propietario' : 'Usuario'}</p>
              <p><strong>Fecha de creación:</strong> {currentUser.fecha_creacion ? new Date(currentUser.fecha_creacion).toLocaleDateString() : 'No disponible'}</p>
              <p><strong>Alarmas Asignadas:</strong>{" "}
                {isLoadingAlarms ? (
                  <LoadingSpinner message="Cargando alarmas..." />
                ) : alarms?.length === 0 ? (
                  'No hay alarmas asignadas'
                ) : (
                  <CardBtnSmall 
                    title={`Ver ${alarms?.length} alarmas`}
                    url={`/panel/usuarios/${currentUser.id}/alarmas`}
                  />
                )}
                { errorAlarms && <p className={styles.error}>{errorAlarms}</p> }
              </p>
            </div>
          </CardImage>

          <Title2 text={`Ubicaciones para el usuario ${currentUser.nombre_1} ${currentUser.apellido_1}`} type="ubicaciones"/>

          {isLoadingLocations ? (
            <LoadingSpinner message="Cargando ubicaciones..." />
          ) : locationUsers?.length > 0 ? (
            <ShowLocationsCards
              locations={activeLocations}
              dataloggers={activeDataloggers}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              showAddButton={false}
            />
          ) : (
            <p className={styles.noLocations}>Este usuario no tiene ubicaciones asignadas</p>
          )}
        </>
      )}
    </>
  );
};

export default ViewUser;