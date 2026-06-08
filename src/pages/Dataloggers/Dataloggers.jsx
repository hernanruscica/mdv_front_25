import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import BreadcrumbAuto from '../../components/Breadcrumb/BreadcrumbAuto';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useLocationsStore } from "../../store/locationsStore";
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';
import styles from './Dataloggers.module.css';
import { DATALOGGERS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const Dataloggers = () => {
  const user = useAuthStore(state => state.user);
  const { businessUuid } = useParams();
  const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoading }, 
    error: dataloggersError,
    fetchDataloggers 
  } = useDataloggersStore();  

    const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    error: locationsError,
    fetchLocations
  } = useLocationsStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [dashboardRouteLocations, setDashboardRouteLocations] = useState([]);

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);

  // Determinamos la data para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? DATALOGGERS_LIST_INFO.Owner 
    : DATALOGGERS_LIST_INFO.General;    

  useEffect(() => {    
    const loadDataloggers = async (businessUuid) => {
    if (businessUuid) {
      await fetchDataloggers(user, businessUuid);  
    }else{
      const currentResponseLocations = await fetchLocations(user);  
      setDashboardRouteLocations(currentResponseLocations.flatMap(location => location.dataloggers));
      //console.log('allDataloggers', allDataloggers);
    }};
    loadDataloggers(businessUuid);
  }, [user, businessUuid, fetchDataloggers]);

  if (isLoading || isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (dataloggersError || locationsError) {
    return <div className={styles.error}>{error}</div>;
  }

  // Buscamos la ubicación actual para el Breadcrumb de forma segura
  const currentBusinessName = dataloggers.find(dl => dl.business.uuid === businessUuid)?.business.name;


  //console.log('businessUuid', businessUuid);
  //console.log('user', user);

  return (
    <>
      <Title1 
        type="dataloggers"
        text="Dataloggers" 
      />

      {/* REEMPLAZO: Acordeón informativo centralizado */}
      <InfoAccordion data={infoData} />

      {/* <Breadcrumb ubicacion={currentBusinessName} /> */}
      <BreadcrumbAuto />
      
      <ShowDataloggersCards
        dataloggers={(businessUuid) 
          ? dataloggers.filter(dl => dl.business.uuid === businessUuid)
          : dashboardRouteLocations
        }              
        // ACTUALIZACIÓN: Verificación de permisos con el nuevo objeto de rol
        showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  );
};

export default Dataloggers;