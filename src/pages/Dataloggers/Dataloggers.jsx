import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import ShowDataloggersCards from '../../components/ShowDataloggersCards/ShowDataloggersCards';
import styles from './Dataloggers.module.css';

// NUEVOS IMPORTS
import { DATALOGGERS_LIST_INFO } from '../../utils/infoContent';
import InfoAccordion from '../../components/InfoAccordion/InfoAccordion';
import { GetUserCurrentRole } from '../../utils/userRoles';

const Dataloggers = () => {
  const user = useAuthStore(state => state.user);
  const { businessUuid } = useParams();
  const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoading }, 
    error,
    fetchDataloggers 
  } = useDataloggersStore();  

  const [searchTerm, setSearchTerm] = useState('');

  // ACTUALIZACIÓN: Lógica de rol unificada
  const userCurrentRole = GetUserCurrentRole(user, businessUuid);

  // Determinamos la data para el acordeón
  const infoData = userCurrentRole?.name === 'Owner' 
    ? DATALOGGERS_LIST_INFO.Owner 
    : DATALOGGERS_LIST_INFO.General;

  useEffect(() => {    
    fetchDataloggers(user, businessUuid);  
  }, [user, businessUuid, fetchDataloggers]);

  if (isLoading) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  // Buscamos la ubicación actual para el Breadcrumb de forma segura
  const currentBusinessName = dataloggers.find(dl => dl.business.uuid === businessUuid)?.business.name;

  return (
    <>
      <Title1 
        type="dataloggers"
        text="Dataloggers" 
      />

      {/* REEMPLAZO: Acordeón informativo centralizado */}
      <InfoAccordion data={infoData} />

      <Breadcrumb ubicacion={currentBusinessName} />
      
      <ShowDataloggersCards
        dataloggers={dataloggers.filter(dl => dl.business.uuid === businessUuid)}              
        // ACTUALIZACIÓN: Verificación de permisos con el nuevo objeto de rol
        showAddButton={userCurrentRole?.name === 'Owner' || userCurrentRole?.name === 'Administrator'}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
    </>
  );
};

export default Dataloggers;