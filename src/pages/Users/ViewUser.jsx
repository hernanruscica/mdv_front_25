import { useState, useEffect } from 'react';
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
  const { businessUuid, userId } = useParams();  
  const [modalOpen, setModalOpen] = useState(false);

  const { selectedUser, fetchUserById, loadingStates, error: errorUsers } = useUsersStore();  

  useEffect(() => {
    const loadUser = async () => {
      if (userId) {
        await fetchUserById(userId, businessUuid);
      }
    };
    loadUser();
  }, [userId, fetchUserById]);

  
  if (loadingStates.fetchUser ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorUsers ) {
    return <div className={styles.error}>Error: {errorUsers }</div>;
  }

  if (!selectedUser) {
    return <div className={styles.error}>Usuario no encontrado.</div>;
  }

  

  const userButtons = (
    selectedUser?.is_active === 1 ?
    (<>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/usuarios/${selectedUser?.uuid}/editar`}
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
        url={`/panel/usuarios/${selectedUser?.uuid}/eliminar`}
      />
    </>)
  );

  //console.log(selectedUser);

  return (
    <>
    <ModalSetArchive
      isOpen={modalOpen}
      onRequestClose={() => setModalOpen(false)}
      entidad="usuario"
      entidadId={selectedUser?.uuid}
      nuevoEstado={selectedUser?.is_active == '1' ? 0 : 1}
      redirectTo={`/panel/usuarios/${selectedUser?.uuid}`}
      nombre={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
    />
{/*}    */}
      {selectedUser && (
        <>
          <Title1
            text={selectedUser ? `Perfil de ${selectedUser.first_name} ${selectedUser.last_name}` : 'Cargando perfil...'}
            type="usuarios"
          />
          <Breadcrumb 
            usuario={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : '' }
            ubicacion={selectedUser?.businesses_roles.find(br => br.uuid === businessUuid).name}
          />
      
          <CardImage
            image={selectedUser?.avatar_url ? `${import.meta.env.VITE_IMAGE_URL}/${selectedUser?.avatar_url}` : '/images/default-user.png'}
            title={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
            buttons={userButtons}
          >
            <div className={styles.userInfo}>
               {
                selectedUser.estado == '0' &&
                (<CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />)
                }
              <p><strong>DNI:</strong> {selectedUser?.dni}</p>
              <p><strong>Email:</strong> {selectedUser?.email}</p>
              <p><strong>Teléfono:</strong> {selectedUser?.phone}</p>
              <p><strong>Estado:</strong> {selectedUser.estado ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Rol:</strong> {selectedUser?.isOwner ? 'Propietario' : 'Usuario'}</p>
              <p><strong>Fecha de creación:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'No disponible'}</p>
              {/*
              <p><strong>Alarmas Asignadas:</strong>{" "}
                {isLoadingAlarms ? (
                  <LoadingSpinner message="Cargando alarmas..." />
                ) : alarms?.length === 0 ? (
                  'No hay alarmas asignadas'
                ) : (
                  <CardBtnSmall
                    title={`Ver ${alarms?.length} alarmas`}
                    url={`/panel/usuarios/${selectedUser.id}/alarmas`}
                  />
                )}
                { errorAlarms && <p className={styles.error}>{errorAlarms}</p> }
              </p>
                */}
            </div>
        </CardImage>

          <Title2 text={`Ubicaciones para el usuario ${selectedUser.first_name} ${selectedUser.last_name}`} type="ubicaciones"/>

          {(selectedUser.businesses_roles.length > 0) ? (          
            <ShowLocationsCards
              locations={selectedUser.businesses_roles}              
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              user={selectedUser}
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
