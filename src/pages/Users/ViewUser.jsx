import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useUsersStore } from '../../store/usersStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewUser.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';

const ViewUser = () => {  
  const [searchTerm, setSearchTerm] = useState('');
  const { id } = useParams();
  const { fetchUserById,  
         users, isLoading: isLoadingUsers, error: errorUsers 
   } = useUsersStore();
  const { fetchAlarmsByUser, alarms, isLoading: isLoadingAlarms, error: errorAlarms } = useAlarmsStore();
  const { fetchLocationUsers, locationUsers, isLoading : isLoadingLocations, error: errorLocationsUsers } = useLocationUsersStore();
  const { dataloggers, isLoading: isLoadingDataloggers, fetchDataloggers, error: errorDataloggers } = useDataloggersStore();

  const user = users.find(user => user.id === parseInt(id));
  const [currentUser, setCurrentUser] = useState(null);

  // Efecto para cargar el usuario
  useEffect(() => {
    const loadUser = async () => {
      const currentUSer = await fetchUserById(id);   
      setCurrentUser(currentUSer);
    };      

    if (!users || users.length === 0) {
      loadUser();         
    } else {      
      setCurrentUser(users.find(user => user.id === parseInt(id)));
    }     
  }, [id]);

  // Nuevo efecto para cargar las alarmas cuando el usuario esté disponible
  useEffect(() => {
    const loadData = async () => {
      if (currentUser) {
        await fetchAlarmsByUser(currentUser); 
        await fetchLocationUsers(currentUser);
        await fetchDataloggers(currentUser);
      }
    };

    loadData();
  }, [currentUser]); // Se ejecutará cuando currentUser cambie

  if (isLoadingUsers ||  isLoadingLocations || isLoadingDataloggers) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorUsers ||  errorLocationsUsers || errorDataloggers) {
    return <div className={styles.error}>Error: {errorUsers || errorLocationsUsers || errorDataloggers }</div>;
  }

  //console.log('Alarmas del usuario:', alarms?.length);
  //console.log('1 ubicacion para el usuario', locationUsers[0]);
  //console.log('dataloggers para el usuario', dataloggers?.length);

  const userButtons = (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/usuarios/editar/${currentUser?.id}`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        url={`/panel/usuarios/eliminar/${currentUser?.id}`}
      />
    </>
  );

  const activeLocations = filterEntitiesByStatus(locationUsers);
  const activeDataloggers = filterEntitiesByStatus(dataloggers);

  return (
    <>
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