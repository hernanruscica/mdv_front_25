import React, { useEffect, useState } from "react";
import { Title1 } from "../../components/Title1/Title1";
import  Breadcrumb  from "../../components/Breadcrumb/Breadcrumb";
import { useAuthStore } from "../../store/authStore";
import { useUsersStore } from "../../store/usersStore";
import { useDataloggersStore } from "../../store/dataloggersStore";
import { useLocationsStore } from "../../store/locationsStore";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";
import { filterEntitiesByStatus } from "../../utils/entityFilters";
import styles from "./Dashboard.module.css";
import CardInfo from '../../components/CardInfo/CardInfo';
import cardInfoStyles from "../../components/CardInfo/CardInfo.module.css";
import CardBtnSmall from "../../components/CardBtnSmall/CardBtnSmall";
import {getIconFileName} from "../../utils/iconsDictionary";


const Dashboard = () => {
  const [showActiveOnly, setShowActiveOnly] = useState(true);
  const user = useAuthStore(state => state.user);
  const { users, isLoading: isLoadingUsers, error: usersError, fetchUsers } = useUsersStore();
  const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoadingDataloggers }, 
    error: dataloggersError, 
    fetchDataloggers 
  } = useDataloggersStore();
  const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    error: locationsError,
    fetchLocations
  } = useLocationsStore();

  useEffect(() => {
    // Función para cargar datos si es necesario
    const loadDataIfNeeded = () => {
      if (!users || users.length === 0) {
        fetchUsers(user);
      }
      if (!dataloggers || dataloggers.length === 0) {
        fetchDataloggers(user);
      }
      if (!locations || locations.length === 0) {
        fetchLocations(user);
      }
    };

    // Función para recargar todos los datos
    const reloadAllData = () => {
      fetchUsers(user);
      fetchDataloggers(user);
      fetchLocations(user);
      localStorage.setItem('dashboardLastUpdate', Date.now().toString());
    };

    // Función para manejar el foco de la ventana
    const handleFocus = () => {
      const now = Date.now();
      const lastUpdate = localStorage.getItem('dashboardLastUpdate');
      if (!lastUpdate || now - parseInt(lastUpdate) > 300000) { // 5 minutos
        reloadAllData();
      }
    };

    // Carga inicial condicional
    loadDataIfNeeded();

    // Configurar revalidación por foco
    window.addEventListener('focus', handleFocus);

    // Configurar revalidación periódica
    const interval = setInterval(reloadAllData, 300000); // 5 minutos

    // Limpieza
    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [user, users, dataloggers, locations]);

  const isLoading = isLoadingUsers || isLoadingDataloggers || isLoadingLocations;
  const error = usersError || dataloggersError || locationsError;

  // Filter entities based on status
  const activeUsers = filterEntitiesByStatus(users, showActiveOnly);
  const activeDataloggers = filterEntitiesByStatus(dataloggers, showActiveOnly);
  const activeLocations = filterEntitiesByStatus(locations, showActiveOnly);

  if (isLoading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <>      
      <Title1 
        type="panel"
        text="Panel de Control" 
      />
      <Breadcrumb />      
      <div className={styles.cardsContainer}>
        <CardInfo
          iconSrc={`/icons/${getIconFileName('usuarios')}`}
          title="Usuarios"
          url="/panel/usuarios"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>
              {activeUsers.length} Usuarios
              </strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {(user?.espropietario === 1) && (
              <CardBtnSmall 
                title='Agregar usuario'
                url='/panel/usuarios/agregar'
              />
            )}            
            {user.espropietario === 1 && showActiveOnly && users?.length > activeUsers.length && (
              <span className={styles.inactiveCount}>
                ({users.length - activeUsers.length} inactivos)
              </span>
            )}  
          </div>
        </CardInfo>

        <CardInfo
          iconSrc={`/icons/${getIconFileName('ubicaciones')}`}
          title="Ubicaciones"
          url="/panel/ubicaciones"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>
                {activeLocations.length} Ubicaciones
              </strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {(user?.espropietario === 1) && (
              <CardBtnSmall 
                title='Agregar ubicación'
                url='/panel/ubicaciones/agregar'
              />
            )}
            {user.espropietario === 1 && showActiveOnly && locations?.length > activeLocations.length && (
              <span className={styles.inactiveCount}>
                ({locations.length - activeLocations.length} inactivas)
              </span>
            )}
          </div>
        </CardInfo>

        <CardInfo
          iconSrc={`/icons/${getIconFileName('dataloggers')}`}
          title="Dataloggers"
          url="/panel/dataloggers"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>
                {activeDataloggers.length} Dataloggers
              </strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {(user?.espropietario === 1) && (
              <CardBtnSmall 
                title='Agregar datalogger'
                url='/panel/dataloggers/agregar'
              />
            )}
            {user.espropietario === 1 && showActiveOnly && dataloggers?.length > activeDataloggers.length && (
              <span className={styles.inactiveCount}>
                ({dataloggers.length - activeDataloggers.length} inactivos)
              </span>
            )}
          </div>
        </CardInfo>

      </div>
    </>
  );
};

export default Dashboard;
