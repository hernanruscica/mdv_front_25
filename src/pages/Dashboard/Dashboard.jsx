import { useEffect, useState } from "react";
import { Title1 } from "../../components/Title1/Title1";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useAuthStore } from "../../store/authStore";
import { useLocationsStore } from "../../store/locationsStore";
import { useUsersStore } from '../../store/usersStore';
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Dashboard.module.css";
import CardInfo from '../../components/CardInfo/CardInfo';
import cardInfoStyles from "../../components/CardInfo/CardInfo.module.css";
import CardBtnSmall from "../../components/CardBtnSmall/CardBtnSmall";
import { getIconFileName } from "../../utils/iconsDictionary";
import { Title2 } from "../../components/Title2/Title2";

// NUEVOS IMPORTS
import { DASHBOARD_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole, mappedCurrentRole } from '../../utils/userRoles';

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const [currentDataloggers, setCurrentDataloggers] = useState([]);
  
  const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    error: locationsError,
    fetchLocations
  } = useLocationsStore();

  const { 
    users, 
    loadingStates,
    error: usersError,
    fetchUsers 
  } = useUsersStore();

  // ACTUALIZACIÓN: Lógica de rol y datos del acordeón
  const userCurrentRole = GetUserCurrentRole(user);
  const infoData = userCurrentRole?.name === 'Owner' 
    ? DASHBOARD_INFO.Owner 
    : DASHBOARD_INFO.General;

  useEffect(() => {
    const loadData = async () => {      
      const currentResponseLocations = await fetchLocations(user);            
      setCurrentDataloggers(currentResponseLocations.flatMap(location => location.dataloggers));        
      fetchUsers(user, user?.businesses_roles[0]?.uuid);    
    };
    loadData();   
  }, [user, fetchLocations, fetchUsers]);

  if (isLoadingLocations || loadingStates?.fetchUsers) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (locationsError || usersError) {
    return <div className={styles.error}>Error cargando datos...</div>;
  }  

  return (
    <>      
      <Title1 type="panel" text="Panel de Control" />
      
      {/* REEMPLAZO: Acordeón centralizado en lugar de las descripciones estáticas */}
      <InfoAccordion data={infoData} />

      <Breadcrumb />     
     
      <Title2 text="Administración" type='panel'/>
      
      <div className={styles.cardsContainer}>

        {/* BUSINESSES */}        
        <CardInfo
          iconSrc={`/icons/${getIconFileName('ubicaciones')}`}
          title="Ubicaciones"
          url="/panel/ubicaciones"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>{locations?.length} Ubicaciones</strong> para administrar.
            </p>  
            {locations?.length > 0 && locations.map(loc => {
                const currentRole = user?.businesses_roles.some(br => br.role === 'Owner') 
                  ? 'Owner' 
                  : user.businesses_roles.find(br => br.uuid === loc.uuid)?.role;
                return(
                <CardBtnSmall 
                  key={loc.uuid} 
                  title={`${loc.name} - Rol: ${mappedCurrentRole[currentRole] || currentRole}`} 
                  url={`/panel/ubicaciones/${loc.uuid}`}/>                
              )
            })}
            {user?.isOwner === 1 && (
              <CardBtnSmall title='Agregar ubicación' url='/panel/ubicaciones/agregar' />
            )}
          </div>
        </CardInfo>

        {/* USERS */} 
        <CardInfo
          iconSrc={`/icons/${getIconFileName('usuarios')}`}
          title="Usuarios"
          url="/panel/usuarios"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>{users?.length || 0} Usuarios</strong> registrados.
            </p>
            <p className={cardInfoStyles.paragraph}>Últimos usuarios modificados:</p>
            {users?.length > 0 && users.slice(0, 4).map(u => (
              <CardBtnSmall 
                key={u?.uuid}
                title={`${u?.first_name} ${u?.last_name}`}
                url={`/panel/ubicaciones/${u?.businesses_roles[0]?.uuid}/usuarios/${u?.uuid}`}
              />
            ))}
            {(user?.isOwner === 1 || user?.esadministrador === true) && (
              <CardBtnSmall title='Agregar usuario' url='/panel/usuarios/agregar' />
            )}
          </div>
        </CardInfo>       

        {/* DATALOGGERS */}
        <CardInfo
          iconSrc={`/icons/${getIconFileName('dataloggers')}`}
          title="Dataloggers"
          url="/panel/ubicaciones"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>{currentDataloggers?.length || 0} Dataloggers</strong> activos.
            </p>
            {currentDataloggers?.length > 0 && currentDataloggers.map(dl => (
              <CardBtnSmall 
                key={dl?.uuid}
                title={`${dl?.name} - ${dl?.business?.name}`}
                url={`/panel/ubicaciones/${dl?.business?.uuid}/dataloggers/${dl?.uuid}`}
              />
            ))}
            {user?.isOwner === 1 && (
              <CardBtnSmall title='Agregar datalogger' url='/panel/dataloggers/agregar' />
            )}
          </div>
        </CardInfo>
      </div>
    </>
  );
};

export default Dashboard;