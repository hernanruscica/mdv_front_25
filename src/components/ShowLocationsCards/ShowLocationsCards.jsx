import { useState } from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowLocationsCards.module.css';
import cardInfoStyles from "../CardInfo/CardInfo.module.css";
import CustomTag from '../CustomTag/CustomTag';

const ShowLocationsCards = ({ 
  locations,   
  searchTerm,
  onSearchChange,
  user,  
  showAddButton = false 
}) => {
  const [showArchived, setShowArchived] = useState(showAddButton);  

  const filteredLocations = locations.filter(location => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch = (
      location?.name.toLowerCase().includes(searchTermLower) ||
      location?.description.toLowerCase().includes(searchTermLower) ||
      location?.address.street.toLowerCase().includes(searchTermLower) ||
      location?.email.toLowerCase().includes(searchTermLower)
    );

    // Filtrar por estado - Corregido para usar el campo 'estado'
    const matchesStatus = showArchived ? true : location.is_active !== 0;

    return matchesSearch && matchesStatus;
  });

  

   const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Administrator': 'Administrador',
    'Technician': 'Operario'
  }

  //console.log(userCurrentRole);
  
  

  return (
    <>
      <div className={styles.controlsContainer}>
        
         <ButtonsBar
          itemsName='ubicaciones'
          items={locations}
          filteredItems={filteredLocations}
          showAddButton={showAddButton}
          addLink={`ubicaciones`}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />
      </div>

      <div className={styles.cardsContainer}>
        {
        filteredLocations.map(location => {

          const userCurrentRole = user.businesses_roles.find(ur => ur.uuid === location.uuid)?.role || 'No encontrado';

          return  (<CardInfo
              key={`location_${location.uuid}`}
              iconSrc={`/icons/${getIconFileName('ubicaciones')}`}
              title={location.name}     
              url={`/panel/ubicaciones/${location.uuid}`}   
            >
              <div className={cardInfoStyles.description}>
                {
                  (location.is_active === 0) && (
                    <CustomTag
                      text="Archivado"
                      type="archive"
                      icon="/icons/archive-solid.svg"
                    />
                  )
                }
                <p className={cardInfoStyles.paragraph}>                 
                  {location.description}                  
                </p>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Dirección:</strong>{" "}
                  {location.address.street} 
                </p>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Teléfono:</strong>{" "}
                  {location.phone}
                </p>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Email:</strong>{" "}
                  {location.email}
                </p>
                <div className={styles.dataloggersList}>
                  <p className={cardInfoStyles.paragraph}>
                    <strong>Dataloggers conectados ({location?.dataloggers?.length}):</strong>
                  </p>
                  {location?.dataloggers && location?.dataloggers.length > 0 ? (
                    <ul className={styles.dataloggerItems}>
                      {location.dataloggers.map(datalogger => (
                        <li key={datalogger.uuid} className={styles.dataloggerItem}>
                          <CardBtnSmall
                            title={datalogger.name}
                            url={`/panel/ubicaciones/${location.uuid}/dataloggers/${datalogger.uuid}`}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noDataloggers}>No hay dataloggers conectados</p>
                  )}
                </div>
                <p className={cardInfoStyles.paragraph}>
                  {`Rol de ${user.first_name} ${user.last_name} : `}
                  <strong>
                    {                      
                      mappedCurrentRole[userCurrentRole]
                    }
                  </strong>
                </p>
              </div>
            </CardInfo>)
        }
          
        )}
      </div>
      {/**/}
    </>
  );
};

export default ShowLocationsCards;
