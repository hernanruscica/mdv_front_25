import React, { useEffect, useState } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CardInfo from '../../components/CardInfo/CardInfo';
import { useAuthStore } from '../../store/authStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import styles from './Locations.module.css';
import cardInfoStyles from "../../components/CardInfo/CardInfo.module.css";
import { getIconFileName } from "../../utils/iconsDictionary";
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../../components/ButtonsBar/ButtonsBar';
import SearchBar from '../../components/SearchBar/SearchBar';

const Locations = () => {
  const [searchTerm, setSearchTerm] = useState(''); // Move state declaration to the top
  const user = useAuthStore(state => state.user);
  const { 
    locations, 
    loadingStates: { fetchLocations: isLoading }, 
    error,
    fetchLocations 
  } = useLocationsStore();

  const {
    dataloggers,
    loadingStates: { fetchDataloggers: isLoadingDataloggers },
    fetchDataloggers
  } = useDataloggersStore();

  useEffect(() => {
    if (!dataloggers || dataloggers.length === 0) {
      fetchDataloggers(user);      
    }
    if (!locations || locations.length === 0) {
      fetchLocations(user);
    }
  }, [user]);

  if (isLoading || isLoadingDataloggers) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const activeLocations = filterEntitiesByStatus(locations);
  const activeDataloggers = filterEntitiesByStatus(dataloggers);

  const filteredLocations = activeLocations.filter(location => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      location.ubicaciones_nombre.toLowerCase().includes(searchTermLower) ||
      location.ubicaciones_descripcion?.toLowerCase().includes(searchTermLower) ||
      location.ubicaciones_calle.toLowerCase().includes(searchTermLower) ||
      location.ubicaciones_email.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <>
      <Breadcrumb />
      <Title1 
        type="ubicaciones"
        text="Ubicaciones" 
      />
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='ubicaciones' 
          itemsQty={filteredLocations.length}
          showAddButton={user.espropietario == 1}
        >
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar ubicaciones..."
          />
        </ButtonsBar>
      </div>
      <div className={styles.cardsContainer}>
        {filteredLocations.map(location => {
          const connectedDataloggers = activeDataloggers.filter(
            datalogger => datalogger.ubicacion_id === location.ubicaciones_id
          );

          return (
            <CardInfo
              key={location.ubicaciones_id}
              iconSrc={`/icons/${getIconFileName('ubicaciones')}`}
              title={location.ubicaciones_nombre}     
              url={`/panel/ubicaciones/${location.ubicaciones_id}`}   
            >
              <div className={cardInfoStyles.description}>
                <p className={cardInfoStyles.paragraph}>                 
                  {location.ubicaciones_descripcion}                  
                </p>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Dirección:</strong>{" "}
                  {location.ubicaciones_calle} {location.ubicaciones_calle_numero}
                </p>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Teléfono:</strong>{" "}
                  {location.ubicaciones_tel}
                </p>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Email:</strong>{" "}
                  {location.ubicaciones_email}
                </p>
                <div className={styles.dataloggersList}>
                  <p className={cardInfoStyles.paragraph}>
                    <strong>Dataloggers conectados ({connectedDataloggers.length}):</strong>
                  </p>
                  {connectedDataloggers.length > 0 ? (
                    <ul className={styles.dataloggerItems}>
                      {connectedDataloggers.map(datalogger => (
                        <li key={datalogger.id} className={styles.dataloggerItem}>
                          <CardBtnSmall
                            title={datalogger.nombre}
                            url={`/panel/dataloggers/${datalogger.id}`}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noDataloggers}>No hay dataloggers conectados</p>
                  )}
                </div>
              </div>
            </CardInfo>
          );
        })}
      </div>
    </>
  );
};

export default Locations;