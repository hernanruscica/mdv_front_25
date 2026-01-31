import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useUsersStore } from '../../store/usersStore';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import CardImage from '../../components/CardImage/CardImage';
import styles from './ViewUser.module.css';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';

//import ShowLocationsCards from '../../components/ShowLocationsCards/ShowLocationsCards';
import Table from '../../components/Table/Table';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import ModalDelete from '../../components/ModalDelete/ModalDelete';
import ModalAsignLocation from '../../components/ModalAsignLocation/ModalAsignLocation';

const ViewUser = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const {businessUuid, userId } = useParams();  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalDeleteOpen, setModalDeleteOpen] = useState(false);
  const [modalAsignLocationOpen, setModalAsignLocationOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clickedBusinessRole, setClickedBusinessRole] = useState({});
  
  

  const { selectedUser, fetchUserById, loadingStates, error: errorUsers } = useUsersStore();  
  const {locations, fetchLocations, loadingStates : {fetchLocations: loadingLocations}, error: errorLocations } = useLocationsStore();

  const { user } = useAuthStore();

  useEffect(() => {
    const loadUser = async () => {
      if (userId || !modalOpen || !modalAsignLocationOpen) {
        await fetchUserById(userId, businessUuid);
        await fetchLocations(user);
      }      
    };
    loadUser();
  }, [userId, fetchUserById, modalOpen, modalAsignLocationOpen]);



  
  if (loadingStates.fetchUser && loadingLocations ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorUsers || errorLocations) {
    return <div className={styles.error}>Error al cargar los datos</div>;
  }

  if (!selectedUser) {
    return <div className={styles.error}>Usuario no encontrado.</div>;
  }

  //console.log('user', user);
  //console.log('selectedUser', selectedUser);
  
  
  

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
      <BtnCallToAction
        text="Eliminar"
        icon="trash-alt-regular.svg"
        type="danger"
        onClick={() => setModalDeleteOpen(true)}
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
        onClick={() => setModalDeleteOpen(true)}
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
    'Administrator': 'Administrador',
    'Technician': 'Operario'
    }

  const availableRoles = [
                          {
                            uuid: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
                            name: 'Administrator'
                          },
                          {
                            uuid: 'c3d4e5f6-a7b8-4c9d-0e1f-2a3b4c5d6e7f',
                            name: 'Technician'
                          }
                        ]
      

   const handleRowClick = (row) => {
    //navigate(`/panel/ubicaciones/${row.businessUuid}/usuarios/${row.id}`);
    setIsEditing(true);
    setModalAsignLocationOpen(true);
    setClickedBusinessRole(selectedUser?.businesses_roles.find(br => br.uuid == row.uuid))
    //console.log('clickebusinessRole', selectedUser?.businesses_roles.find(br => br.uuid == row.uuid));
  };

  const preparedData = (Array.isArray(selectedUser?.businesses_roles) && selectedUser?.businesses_roles.length > 0) 
    ? selectedUser?.businesses_roles.map(br => ({
        uuid: br.uuid,        
        locationName: br?.name,
        locationAddress: `${br?.address?.street} - ${br?.address?.city}`,
        roleName: br?.role, 
        rolUsuarioNombre: mappedCurrentRole[br?.role]               
      }))
    : [];  

    const columns = [
    { 
      label: 'Ubicacion', 
      accessor: 'locationName',
      icon: '/icons/building-regular.svg' 
    },
    { 
      label: 'Direccion', 
      accessor: 'locationAddress',
      icon: '/icons/home-solid.svg' 
    } ,
    { 
      label: 'rol del usuario', 
      accessor: 'rolUsuarioNombre',
      icon: '/icons/user-shield-solid.svg' 
    },           
  ];

 //console.log('user', user);
 //console.log('selecteduser', selectedUser);
 //console.log(userCurrentRole == 'Technician' && user.uuid == selectedUser.uuid )
 //console.log('isediting', isEditing)
 //console.log('clickedBusinessRoleUuid', clickedBusinessRole?.business_user_uuid);
 

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
    <ModalDelete
      isOpen={modalDeleteOpen}
      onRequestClose={() => setModalDeleteOpen(false)}
      entidad="usuario"
      entidadId={selectedUser?.uuid}      
      redirectTo={`/panel/ubicaciones/${businessUuid}/usuarios/`}
      nombre={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
      businessUuid={businessUuid}
    />   
    <ModalAsignLocation
      isOpen={modalAsignLocationOpen}
      onRequestClose={() => {setModalAsignLocationOpen(false); setIsEditing(false)}}
      isEditing = { isEditing }
      user= {selectedUser}
      availableLocations = {!isEditing   
        ? locations.filter(loc => !selectedUser?.businesses_roles?.some(br => br.uuid === loc.uuid)) 
        : locations }
      availableRoles = { availableRoles }
      currentRole = {clickedBusinessRole?.role}
      currentLocation = {clickedBusinessRole}
      redirectTo={`/panel/ubicaciones/${businessUuid}/usuarios/`}
      nombre={`${selectedUser?.first_name} ${selectedUser?.last_name}`}
      businessUuid={businessUuid}
    />

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


         {
          (userCurrentRole == 'Owner') ?
          <BtnCallToAction
              text="Asignar ubicacion al usuario"
              icon="plus-circle-solid.svg"
              type="normal"
              onClick={() => setModalAsignLocationOpen(true)}              
          />
          :
          ''
        }
          {(selectedUser.businesses_roles.length > 0) ? (          
           
            // <ShowLocationsCards
            //   locations={selectedUser.businesses_roles}              
            //   searchTerm={searchTerm}
            //   onSearchChange={setSearchTerm}
            //   user={selectedUser}
            //   showAddButton={false}
            // />
            
            <div className={styles.tableContainer}>      
              <Table 
                columns={columns} 
                data={preparedData} 
                onRowClick={handleRowClick}
                showAddButton={false}
                addUrl={`/panel/ubicaciones/${businessUuid}/usuarios/agregar`}
              />       
            </div>
          ) : (
            <p className={styles.noLocations}>Este usuario no tiene ubicaciones asignadas</p>
          )}
            
        </>
      )}
        
    </>
  );
};

export default ViewUser;
