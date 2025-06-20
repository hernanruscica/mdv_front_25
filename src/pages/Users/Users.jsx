import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  
  useEffect(() => {   
    // if (!users || users.length === 0) {
    //   fetchUsers(user);
    //   console.log('Actualizando los usuarios a mostrar');
    // }

   fetchUsers(user);
   console.log('Actualizando los usuarios a mostrar en Users.jsx');
  }, [user, fetchUsers]);



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
    navigate(`/panel/usuarios/${row.id}`);
  };

  const preparedData = users?.map(user => ({
    nombreCompleto: user.usuario_nom_apell,
    email: user.email,
    ubicaciones: Array.isArray(user.ubicaciones) && user.ubicaciones.length > 0
      ? user.ubicaciones.map(ubi => ubi.ubicaciones_nombre).join(', ')
      : 'N/A',
    id: user.id,
    estado: user.estado
  }));

  //console.log('preparedData', preparedData)

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
          showAddButton={ user?.espropietario == 1}
        />
      </div>
    </>
  );
};

export default Users;