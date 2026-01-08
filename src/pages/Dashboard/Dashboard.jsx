import { useEffect, useState } from "react";
import { Title1 } from "../../components/Title1/Title1";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useAuthStore } from "../../store/authStore";
import { useLocationsStore } from "../../store/locationsStore";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Dashboard.module.css";
import CardInfo from '../../components/CardInfo/CardInfo';
import cardInfoStyles from "../../components/CardInfo/CardInfo.module.css";
import CardBtnSmall from "../../components/CardBtnSmall/CardBtnSmall";
import { getIconFileName } from "../../utils/iconsDictionary";
import { Title2 } from "../../components/Title2/Title2";

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const [currentDataloggers, setCurrentDataloggers] = useState([]);
  const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    error: locationsError,
    fetchLocations
  } = useLocationsStore();

  

  useEffect(() => {
    const loadData = async () => {      
      const currentResponseLocations = await fetchLocations(user);            
      setCurrentDataloggers(currentResponseLocations.flatMap(location => location.dataloggers));            
    };
    loadData();   
  }, []);

  

  if (isLoadingLocations ) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (locationsError) {
    return <div className={styles.error}>Error cargando datos...</div>;
  }  

 const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : '';
  const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Administrator': 'Administrador',
    'Technician': 'Operario'
  }

  return (
    <>      
      <Title1 type="panel" text="Panel de Control" />
      <Breadcrumb />     
      <p className={styles.description}>
        Bienvenido al panel de control de <strong>MDV Sensores</strong>, su sistema integral para la gestión y monitoreo de dataloggers, ubicaciones, usuarios y alarmas. Desde este panel, usted puede supervisar el estado de sus equipos, administrar usuarios y configurar alarmas críticas para garantizar el funcionamiento óptimo de sus operaciones.
      </p>     
     
      <Title2 text="Administracion" type='panel'/>
      
      <p className={styles.description}>
        {
          userCurrentRole == 'Owner'
          ? 'Como propietario, usted tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema.'
          : 'Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.'
        }
      </p>

      <div className={styles.cardsContainer}>

        {/* BUSINESSES */}        
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
            {
              locations?.length > 0 &&
              locations.map(loc => {
                const currentRole = user?.businesses_roles.some(br => br.role === 'Owner') 
                  ? 'Owner' 
                  : user.businesses_roles.find(br => br.uuid === loc.uuid)?.role;
                return(
                <CardBtnSmall 
                  key={loc.uuid} 
                  title={`${loc.name} - Rol: ${mappedCurrentRole[currentRole]}`} 
                  url={`/panel/ubicaciones/${loc.uuid}`}/>                
              )}
            )
            }
            {user?.isOwner === 1 && (
              <CardBtnSmall 
                title='Agregar ubicación'
                url='/panel/ubicaciones/agregar'
              />
            )}
          </div>
        </CardInfo>

        {/* USERS 
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
            {(user?.isOwner == 1 || user?.esadministrador == true) && (
              <CardBtnSmall 
                title='Agregar usuario'
                url='/panel/usuarios/agregar'
              />
            )}
          </div>
        </CardInfo>*/}        

        {/* DATALOGGERS */}
        <CardInfo
          iconSrc={`/icons/${getIconFileName('dataloggers')}`}
          title="Dataloggers"
          url="/panel/ubicaciones"
        >
          <div className={cardInfoStyles.description}>
            <p className={cardInfoStyles.paragraph}>
              <strong>{currentDataloggers?.length} Dataloggers</strong>{" "}
              para ver o administrar, según los permisos de su usuario.
            </p>
            {
              currentDataloggers?.length > 0 
              ? currentDataloggers.map(dl => (
                <CardBtnSmall 
                key={dl?.uuid}
                title={`${dl?.name} - ${dl?.business.name}`}
                url={`/panel/ubicaciones/${dl?.business.uuid}/dataloggers/${dl?.uuid}`}
              />
              ))
              : ''
            }
            {user?.isOwner === 1 && (
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
