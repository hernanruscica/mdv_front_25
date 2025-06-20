import React, { useState } from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import SearchBar from '../SearchBar/SearchBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowLocationsCards.module.css';
import cardInfoStyles from "../CardInfo/CardInfo.module.css";
import CustomTag from '../CustomTag/CustomTag';

const ShowLocationsCards = ({ 
  locations, 
  dataloggers, 
  searchTerm,
  onSearchChange,
  showAddButton = false 
}) => {
  const [showArchived, setShowArchived] = useState(showAddButton);

  const filteredLocations = locations.filter(location => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      location.ubicaciones_nombre.toLowerCase().includes(searchTermLower) ||
      location.ubicaciones_descripcion?.toLowerCase().includes(searchTermLower) ||
      location.ubicaciones_calle.toLowerCase().includes(searchTermLower) ||
      location.ubicaciones_email.toLowerCase().includes(searchTermLower)
    );

    // Filtrar por estado - Corregido para usar el campo 'estado'
    const matchesStatus = showArchived ? true : location.estado !== 0;

    return matchesSearch && matchesStatus;
  });

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='ubicaciones' 
          itemsQty={filteredLocations.length}
          showAddButton={showAddButton}
        >
          <div className={styles.controls}>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              placeholder="Buscar ubicaciones..."
            />
            {showAddButton && (
            <label className={styles.checkboxContainer}>
              <input
                type="checkbox"
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
              <span>Mostrar tambien las archivadas</span>
            </label>
            )}
          </div>
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
                {
                  (location.estado === 0) && (
                    <CustomTag
                      text="Archivado"
                      type="archive"
                      icon="/icons/archive-solid.svg"
                    />
                  )
                }
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