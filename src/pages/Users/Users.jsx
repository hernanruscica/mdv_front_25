import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useUsersStore } from '../../store/usersStore';
import { useLocationUsersStore } from '../../store/locationUsersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import styles from './Users.module.css';
import Table from '../../components/Table/Table';

const Users = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const user = useAuthStore(state => state.user);
  const { 
    users, 
    loadingStates,
    error,
    fetchUsers 
  } = useUsersStore();

  const { 
    locationUsers, 
    loadingStates: locationUsersLoadingStates,
    fetchLocationUsers 
  } = useLocationUsersStore();

  const isLoading = loadingStates?.fetchUsers || locationUsersLoadingStates?.fetchLocationUsers;

  useEffect(() => {
    if (!users || users.length === 0) {
      fetchUsers(user);
    }
    if (!locationUsers || locationUsers.length === 0) {
      fetchLocationUsers(user);
    }
  }, [user]);

  if (isLoading || !users || !locationUsers) {
    return <LoadingSpinner message="Cargando usuarios..." />;
  } 

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }  


//habria que poner un check para mostrar ademas los usuarios archivados
  //const activeUsers = filterEntitiesByStatus(users);
 

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
    navigate(`/panel/usuarios/${row.id}`);
  };

  const preparedData = users.map(user => ({
    nombreCompleto: user.usuario_nom_apell,
    email: user.email,    
    ubicaciones: user.ubicaciones.map(ubi => ubi.ubicaciones_nombre).join(', '),
    id: user.id,
    estado: user.estado
  }));

  console.log('user', users[0])

  return (
    <>
      <Title1 
        type="usuarios"
        text="Usuarios" 
      />
      <Breadcrumb />
      
      <div className={styles.tableContainer}>
        <Table 
          columns={columns} 
          data={preparedData} 
          onRowClick={handleRowClick}
        />
      </div>
    </>
  );
};

export default Users;