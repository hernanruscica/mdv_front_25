import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useUsersStore } from '../../store/usersStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewUser.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import CardInfo from '../../components/CardInfo/CardInfo';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';
import { getIconFileName } from '../../utils/iconsDictionary';

const ViewUser = () => {  
  const { id } = useParams();
  const { fetchUserById,  
         users, isLoading: isLoadingUsers, error: errorUsers 
   } = useUsersStore();
  const { fetchAlarmsByUser, alarms, isLoading: isLoadingAlarms, error: errorAlarms } = useAlarmsStore();
  const { fetchLocationUsers, locationUsers, isLoading : isLoadingLocations } = useLocationUsersStore();

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
      }
    };

    loadData();
  }, [currentUser]); // Se ejecutará cuando currentUser cambie

  if (isLoadingUsers ||  isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorUsers || errorAlarms) {
    return <div>Error: {errorUsers || errorAlarms }</div>;
  }

  console.log('Alarmas del usuario:', alarms?.length);
  console.log('ubicaciones para el usuario', locationUsers?.length);

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
  return (
    <>
      <Title1 
        text={`Perfil de ${currentUser?.nombre_1} ${currentUser?.apellido_1}`}
        type="usuarios"
      />
      <Breadcrumb />
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
              </p>
            </div>
          </CardImage>

          <div className={styles.locationsContainer}>
            {isLoadingLocations ? (
              <LoadingSpinner message="Cargando ubicaciones..." />
            ) : locationUsers?.length > 0 ? (
              locationUsers.map(location => (
                <CardInfo
                  key={location.ubicaciones_id}
                  iconSrc={`/icons/${getIconFileName('ubicaciones')}`}
                  title={location.ubicaciones_nombre}
                  url={`/panel/ubicaciones/${location.ubicaciones_id}`}
                >
                  <div className={cardInfoStyles.description}>
                    <p className={cardInfoStyles.paragraph}>
                      {location.ubicaciones_descripcion}
                    </p>
                    <p className={cardInfoStyles.paragraph}>
                      <strong>Dirección:</strong>{" "}
                      {location.ubicaciones_calle} {location.ubicaciones_calle_numero}
                    </p>
                    <p className={cardInfoStyles.paragraph}>
                      <strong>Teléfono:</strong>{" "}
                      {location.ubicaciones_tel}
                    </p>
                    <p className={cardInfoStyles.paragraph}>
                      <strong>Email:</strong>{" "}
                      {location.ubicaciones_email}
                    </p>
                  </div>
                </CardInfo>
              ))
            ) : (
              <p className={styles.noLocations}>Este usuario no tiene ubicaciones asignadas</p>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default ViewUser;