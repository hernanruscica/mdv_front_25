import React from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import SearchBar from '../SearchBar/SearchBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowLocationsCards.module.css';
import cardInfoStyles from "../CardInfo/CardInfo.module.css";

const ShowLocationsCards = ({ 
  locations, 
  dataloggers, 
  searchTerm,
  onSearchChange,
  showAddButton = false 
}) => {
  const filteredLocations = locations.filter(location => {
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
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='ubicaciones' 
          itemsQty={filteredLocations.length}
          showAddButton={showAddButton}
        >
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Buscar ubicaciones..."
          />
        </ButtonsBar>
      </div>

      <div className={styles.cardsContainer}>
        {filteredLocations.map(location => {
          const connectedDataloggers = dataloggers.filter(
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

export default ShowLocationsCards;