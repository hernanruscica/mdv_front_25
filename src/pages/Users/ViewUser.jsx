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

import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';

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

  const { user } = useAuthStore();

  
  if (loadingStates.fetchUser ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorUsers ) {
    return <div className={styles.error}>Error: {errorUsers }</div>;
  }

  if (!selectedUser) {
    return <div className={styles.error}>Usuario no encontrado.</div>;
  }

  console.log('user', user);
  
  

  const userButtons = (
    selectedUser?.is_active == 1 ?
    (<>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/ubicaciones/${businessUuid}/usuarios/${selectedUser?.uuid}/editar`}
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

    </>)
  );

    const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

    const selectedUserCurrentRole = 
      selectedUser?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : selectedUser?.businesses_roles.find(br => br.uuid === businessUuid)?.role;
     const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Admin': 'Administrador',
    'Technician': 'Operario'
  }

 console.log('user', user);
 console.log('selecteduser', selectedUser);
 console.log(userCurrentRole == 'Technician' && user.uuid == selectedUser.uuid )
 

  return (
    <>
    <ModalSetArchive
      isOpen={modalOpen}
      onRequestClose={() => setModalOpen(false)}
      entidad="usuario"
      entidadId={selectedUser?.uuid}
      nuevoEstado={selectedUser?.is_active === 1 ? 0 : 1}
      redirectTo={`/panel/ubicaciones/${businessUuid}/usuarios/${selectedUser?.uuid}`}
      nombre={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
      businessUuid={businessUuid}
    />
{/*}    */}
      {selectedUser && (
        <>
          <Title1
            text={selectedUser ? `Perfil de ${selectedUser.first_name} ${selectedUser.last_name}` : 'Cargando perfil...'}
            type="usuarios"
          />
          {
            userCurrentRole == 'Owner'
            ? <>
              <p className={styles.description}>
                Usted se encuentra en la pagina para ver mas detalles del usuario seleccionado.<br/><br/>
                Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
                En esta pagina puede: <strong> Editar y/o archivar al usuario</strong> actual. <br/><br/>
                Un usuario puede estar asociado a una o varias ubicaciones. Dentro de cada ubicacion, podra ver los dataloggers, canales y/o alarmas (si tiene asociadas)<br/><br/>
                Puede ver las ubicaciones donde pertenece, buscar, ver u ocultar las archivadas segun sea necesario.
              </p>          
            </>
            : <p className={styles.description}>
                Usted se encuentra en la pagina para ver mas detalles del usuario seleccionado.<br/><br/>
                Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
              </p>
          }
          <Breadcrumb 
            usuario={selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : '' }
            ubicacion={selectedUser?.businesses_roles.find(br => br.uuid === businessUuid)?.name}
          />
      
          <CardImage
            image={selectedUser?.avatar_url ? `${selectedUser?.avatar_url}` : '/images/default_avatar.png'}
            title={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
            buttons={ (userCurrentRole == 'Owner' || userCurrentRole == 'Administrator')               
              ? userButtons
              : (userCurrentRole == 'Technician' && user.uuid == selectedUser.uuid )
              ?
              <BtnCallToAction
                  text="Editar"
                  icon="edit-regular.svg"
                  type="warning"
                  url={`/panel/ubicaciones/${businessUuid}/usuarios/${selectedUser?.uuid}/editar`}
                />
               : ''
              }
          >
            <div className={styles.userInfo}>
               {
                selectedUser.is_active == '0' &&
                (<CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />)
                }
              <p><strong>DNI:</strong> {selectedUser?.dni}</p>
              <p><strong>Email:</strong> {selectedUser?.email}</p>
              <p><strong>Teléfono:</strong> {selectedUser?.phone}</p>
              <p><strong>Estado:</strong> {selectedUser.is_active ? 'Activo' : 'Inactivo'}</p>
              <p><strong>Rol:</strong> {mappedCurrentRole[selectedUserCurrentRole]} </p>
              <p><strong>Fecha de creación:</strong> {selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'No disponible'}</p>
              <CardBtnSmall
                key={selectedUser.uuid}
                title="Ver Alarmas del Usuario"
                url={`/panel/ubicaciones/${businessUuid}/usuarios/${selectedUser.uuid}/alarmas`}
              />              
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
