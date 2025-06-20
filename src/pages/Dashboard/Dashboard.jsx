import React, { useEffect } from "react";
import { Title1 } from "../../components/Title1/Title1";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useAuthStore } from "../../store/authStore";
import { useUsersStore } from "../../store/usersStore";
import { useDataloggersStore } from "../../store/dataloggersStore";
import { useLocationsStore } from "../../store/locationsStore";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Dashboard.module.css";
import CardInfo from '../../components/CardInfo/CardInfo';
import cardInfoStyles from "../../components/CardInfo/CardInfo.module.css";
import CardBtnSmall from "../../components/CardBtnSmall/CardBtnSmall";
import { getIconFileName } from "../../utils/iconsDictionary";

const Dashboard = () => {
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
    const loadData = () => {
      fetchUsers(user);
      fetchDataloggers(user);
      fetchLocations(user);
    };

    loadData();
    
    // Recargar datos cada 5 minutos
    const interval = setInterval(loadData, 300000);
    return () => clearInterval(interval);
  }, [user, fetchUsers, fetchDataloggers, fetchLocations]);

  //const isLoading = isLoadingUsers || isLoadingDataloggers || isLoadingLocations;
  const error = usersError || dataloggersError || locationsError;

  if (isLoadingUsers || isLoadingDataloggers || isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }
  //console.log(locations)

  return (
    <>      
      <Title1 type="panel" text="Panel de Control" />
      <Breadcrumb />      
      <div className={styles.cardsContainer}>
        <CardInfo
          iconSrc={`/icons/${getIconFileName('usuarios')}`}
          title="Usuarios"
          url="/panel/usuarios"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>{users.length} Usuarios</strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {user?.espropietario === 1 && (
              <CardBtnSmall 
                title='Agregar usuario'
                url='/panel/usuarios/agregar'
              />
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
              <strong>{locations?.length} Ubicaciones</strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {user?.espropietario === 1 && (
              <CardBtnSmall 
                title='Agregar ubicación'
                url='/panel/ubicaciones/agregar'
              />
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
              <strong>{dataloggers.length} Dataloggers</strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {user?.espropietario === 1 && (
              <CardBtnSmall 
                title='Agregar datalogger'
                url='/panel/dataloggers/agregar'
              />
            )}
          </div>
        </CardInfo>
      </div>
    </>
  );
};

export default Dashboard;
