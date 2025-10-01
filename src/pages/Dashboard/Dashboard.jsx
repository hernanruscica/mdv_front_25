import { useEffect, useState } from "react";
import { Title1 } from "../../components/Title1/Title1";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import { useAuthStore } from "../../store/authStore";
import { useUsersStore } from "../../store/usersStore";
import { useDataloggersStore } from "../../store/dataloggersStore";
import { useLocationsStore } from "../../store/locationsStore";
import { useAlarmsStore } from "../../store/alarmsStore";
import { LoadingSpinner } from "../../components/LoadingSpinner/LoadingSpinner";
import styles from "./Dashboard.module.css";
import CardInfo from '../../components/CardInfo/CardInfo';
import cardInfoStyles from "../../components/CardInfo/CardInfo.module.css";
import CardBtnSmall from "../../components/CardBtnSmall/CardBtnSmall";
import { getIconFileName } from "../../utils/iconsDictionary";

import GaugeLinear from '../../components/GaugeLinear/GaugeLinear';
import { Title2 } from "../../components/Title2/Title2";
import { Link } from "react-router-dom";

import { useAlarmsGaugesData } from '../../hooks/useAlarmsGaugesData';

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
      //console.log('currentResponseLocations', currentResponseLocations);
      
      setCurrentDataloggers(currentResponseLocations.flatMap(location => location.dataloggers));      
    };
    loadData();   
  }, []);

  

  if (isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (locationsError) {
    return <div className={styles.error}>{locationsError}</div>;
  }
  
  //console.log('dataloggers', dataloggers)

  return (
    <>      
      <Title1 type="panel" text="Panel de Control" />
      <Breadcrumb />     
      {/* 
      <Title2 text="Datos en tiempo real" type='alarmas'/>
      <div className={styles.cardsContainer}>
        {alarms && alarms.length > 0 && (
          alarms.map((alarm, index) => { 
            if (alarm.estado !== 1) return null;
            if (alarm.tipo_alarma !== 'PORCENTAJE_ENCENDIDO') return null;
            const key = `${alarm.tabla}_${alarm.columna}`;
            const currentValue = lastDataByChannel[key] || 0;
            //console.log('[Dashboard] key:', key, 'currentValue:', currentValue);
            return (
              <Link 
                to={`/panel/dataloggers/${alarm.datalogger_id}/canales/${alarm.canal_id}`} 
                title="Ver canal"
                key={index} 
                className={styles.cardGauge}>
                <h3>{alarm.nombre} %</h3>             
                <GaugeLinear currentValue={currentValue} alarmMin={0} alarmMax={alarm.variable01} />
              </Link>
            );
          })
        )}
      </div>
      */}
      <Title2 text="Administracion" type='panel'/>
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
                  title={`${loc.name} - Role: ${currentRole}`} 
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
