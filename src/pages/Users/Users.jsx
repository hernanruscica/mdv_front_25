import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './Users.module.css';
import Table from '../../components/Table/Table';

// NUEVOS IMPORTS
import { USERS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const Users = () => {
  const navigate = useNavigate(); 
  const user = useAuthStore(state => state.user);
  const { 
    users, 
    loadingStates: {fetchUsers : isLoadingUsers},
    fetchUsers,
    error,
  } = useUsersStore();
  const { 
    selectedLocation,
    fetchLocationById,
    loadingStates: { fetchLocation: isLoadingLocation}
  } = useLocationsStore();

  
  const { businessUuid } = useParams();

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);
  
  // Determinamos la información para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? USERS_LIST_INFO.Owner 
    : USERS_LIST_INFO.General;

  useEffect(() => {       
    if (businessUuid){
      fetchUsers(user, businessUuid);
      fetchLocationById(businessUuid);      
    } else {
      fetchUsers(user, user?.businesses_roles[0].uuid || businessUuid);
      fetchLocationById(user?.businesses_roles[0].uuid  || businessUuid);
    }
  }, [user, businessUuid]);

  if (isLoadingUsers || isLoadingLocation || !user ) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  } 

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }  

  const columns = [
    { label: 'NOMBRE Y APELLIDO', accessor: 'nombreCompleto', icon: '/icons/user-regular.svg' },
    { label: 'CORREO ELECTRONICO', accessor: 'email', icon: '/icons/envelope-regular.svg' },    
    { label: 'UBICACION/ES', accessor: 'ubicaciones', icon: '/icons/building-regular.svg' },   
    { label: 'ESTADO', accessor: 'estado', icon: '/icons/eye-regular.svg' }
  ];

  const handleRowClick = (row) => {
    navigate(`/panel/ubicaciones/${row.businessUuid}/usuarios/${row.id}`);
  };

  const filterUsersByOwner = (userCurrentRole?.name === 'Owner' && businessUuid)
    ? users?.filter(us => us?.businesses_roles.some(br => br.uuid == businessUuid))
    : users;

  const preparedData = (filterUsersByOwner.length > 0) 
    ? filterUsersByOwner.map(us => ({
        nombreCompleto: us.first_name + ' ' + us.last_name,
        email: us.email,
        ubicaciones: Array.isArray(us.businesses_roles) && us.businesses_roles.length > 0
          ? us.businesses_roles.map(ubi => ubi.name).join(', ')
          : 'N/A',
        id: us.uuid,
        businessUuid: (businessUuid !== undefined && businessUuid !== null) 
          ? businessUuid : us?.businesses_roles?.[0]?.uuid 
          || user?.businesses_roles[0]?.uuid,
        estado: us.is_active
      }))
    : [];  
        
  return (
    <>
      <Title1 type="usuarios" text="Usuarios" />
      
      {/* REEMPLAZO: Acordeón centralizado en lugar de párrafos condicionales */}
      <InfoAccordion data={infoData} />

      <Breadcrumb ubicacion={selectedLocation?.name || 'Desconocida'} />
      
      <div className={styles.tableContainer}>      
        <Table 
          columns={columns} 
          data={preparedData} 
          onRowClick={handleRowClick}
          showAddButton={ userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
          addUrl={`/panel/ubicaciones/${businessUuid}/usuarios/agregar`}
        />       
      </div>
    </>
  );
};

export default Users;