import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
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

  const isLoading = loadingStates?.fetchUsers;  
  const { businessUuid } = useParams();
  
  useEffect(() => {   
    

   fetchUsers(user, businessUuid);
   
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

  const preparedData = users?.map(user => ({
    nombreCompleto: user.first_name + ' ' + user.last_name,
    email: user.email,
    ubicaciones: Array.isArray(user.businesses_roles) && user.businesses_roles.length > 0
      ? user.businesses_roles.map(ubi => ubi.name).join(', ')
      : 'N/A',
    id: user.uuid,
    businessUuid: businessUuid,
    estado: user.is_active
  }));  

  const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

        console.log(userCurrentRole);
        
  return (
    <>
      <Title1 
        type="usuarios"
        text="Usuarios" 
      />
      <Breadcrumb       
        ubicacion={users[0]?.businesses_roles.find(br => br.uuid === businessUuid).name}
      />
      
      <div className={styles.tableContainer}>
        <Table 
          columns={columns} 
          data={preparedData} 
          onRowClick={handleRowClick}
          showAddButton={ userCurrentRole === 'Owner'  || userCurrentRole === 'Administrator'}
        />
      </div>
    </>
  );
};

export default Users;