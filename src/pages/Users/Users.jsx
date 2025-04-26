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

  const activeUsers = filterEntitiesByStatus(users);

  const getUserLocations = (userId) => {
    if (!locationUsers) return 'Sin ubicación';
    const userLocations = locationUsers.filter(lu => lu.usuarios_id === userId);
    return userLocations.map(lu => lu.ubicaciones_nombre).join(', ') || 'Sin ubicación';
  };

  const filteredUsers = activeUsers.filter(user => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.nombre_1?.toLowerCase().includes(searchTermLower) ||
      user.apellido_1?.toLowerCase().includes(searchTermLower)
    );
  });

  const columns = [
    { label: 'NOMBRE Y APELLIDO', accessor: 'nombreCompleto' },
    { label: 'CORREO ELECTRONICO', accessor: 'email' },
    { label: 'UBICACION/ES', accessor: 'ubicaciones' }
  ];

  const handleRowClick = (row) => {
    navigate(`/panel/usuarios/${row.id}`);
  };

  const preparedData = filteredUsers.map(user => ({
    nombreCompleto: `${user.nombre_1} ${user.apellido_1}`,
    email: user.email,
    ubicaciones: getUserLocations(user.id),
    id: user.id
  }));

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