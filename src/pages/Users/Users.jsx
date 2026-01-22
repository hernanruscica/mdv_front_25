import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './Users.module.css';
import Table from '../../components/Table/Table';

const Users = () => {
  const navigate = useNavigate(); 
  const user = useAuthStore(state => state.user);
  const { 
    users, 
    loadingStates,
    error,
    fetchUsers 
  } = useUsersStore();
  const { 
    selectedLocation,
    fetchLocationById,
    loadingStates: { fetchLocation: isLoadingLocation}
  } = useLocationsStore();

  
  const isLoading = loadingStates?.fetchUsers || isLoadingLocation;  
  const { businessUuid } = useParams();

  const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;
  
  useEffect(() => {       

    if (businessUuid){
      //console.log('has businessUuid');
      
      fetchUsers(user, businessUuid);
      fetchLocationById(businessUuid);      
    }else{
      //console.log(`hasn't businessUuid`, user?.businesses_roles[0].uuid);
      fetchUsers(user, user?.businesses_roles[0].uuid || businessUuid);
      fetchLocationById(user?.businesses_roles[0].uuid  || businessUuid);
    }


  }, [user, businessUuid]);



  if (isLoading || !users ) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  } 

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }  

  //console.log('users', users);  

  const columns = [
    { 
      label: 'NOMBRE Y APELLIDO', 
      accessor: 'nombreCompleto',
      icon: '/icons/user-regular.svg' 
    },
    { 
      label: 'CORREO ELECTRONICO', 
      accessor: 'email',
      icon: '/icons/envelope-regular.svg' 
    },    
    { 
      label: 'UBICACION/ES', 
      accessor: 'ubicaciones',
      icon: '/icons/building-regular.svg' 
    },   
    { 
      label: 'ESTADO', 
      accessor: 'estado',
      icon: '/icons/eye-regular.svg' 
    }
  ];

  const handleRowClick = (row) => {
    navigate(`/panel/ubicaciones/${row.businessUuid}/usuarios/${row.id}`);
  };

  const filterUsersByOwner = (userCurrentRole == 'Owner' && businessUuid)
    ? users?.filter(us => us?.businesses_roles.some(br => br.uuid == businessUuid))
    : users;

    console.log('filterUsersByOwner', filterUsersByOwner);  
    
    

  const preparedData = (filterUsersByOwner.length > 0) 
    ? filterUsersByOwner.map(user => ({
        nombreCompleto: user.first_name + ' ' + user.last_name,
        email: user.email,
        ubicaciones: Array.isArray(user.businesses_roles) && user.businesses_roles.length > 0
          ? user.businesses_roles.map(ubi => ubi.name).join(', ')
          : 'N/A',
        id: user.uuid,
        businessUuid: businessUuid || user.businesses_roles[0].uuid,
        estado: user.is_active
      }))
    : [];  



        console.log('user', user);
        
  return (
    <>
      <Title1 
        type="usuarios"
        text="Usuarios" 
      />
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Usted se encuentra en la pagina para ver los usuarios de la ubicacion actual.<br/><br/>
            Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            En esta pagina puede: <strong> Ver el listado de usuarios</strong>, algunos datos y/o hacer <strong>click para ver mas</strong> datos de un usuario. <br/><br/>
            Y tambien puede <strong>agregar nuevos usuarios</strong> a la ubicacion actual.<br/><br/>
            Un usuario puede estar asociado a una o varias ubicaciones. 
            Dentro de cada usuario, podra ver a que ubicacion/es donde esta asociado, los dataloggers, canales y/o alarmas (si tiene asociadas)<br/><br/>
            Puede ver las ubicaciones donde pertenece, buscar, ver u ocultar los usuarios archivados segun sea necesario.
          </p>          
        </>
        : <p className={styles.description}>
            Usted se encuentra en la pagina para ver mas detalles del usuario seleccionado.<br/><br/>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
      <Breadcrumb       
        ubicacion={selectedLocation?.name || 'Desconocida'}
      />
      
      <div className={styles.tableContainer}>      
        <Table 
          columns={columns} 
          data={preparedData} 
          onRowClick={handleRowClick}
          showAddButton={ userCurrentRole === 'Owner'  || userCurrentRole === 'Administrator'}
          addUrl={`/panel/ubicaciones/${businessUuid}/usuarios/agregar`}
        />       
      </div>
    </>
  );
};

export default Users;