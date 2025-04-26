import React, { useState, useCallback } from 'react';
import ReactModal from 'react-modal';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import SearchBar from '../SearchBar/SearchBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import styles from './ShowDataloggersCards.module.css';
import cardInfoStyles from '../CardInfo/CardInfo.module.css';

const ShowDataloggersCards = ({ 
  dataloggers, 
  channels, 
  alarms, 
  locations,
  showAddButton = false 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    type: null,
    dataloggerId: null,
    title: ''
  });

  const openModal = useCallback((type, dataloggerId, itemCount, dataloggerName) => {
    setModalContent({
      isOpen: true,
      type,
      dataloggerId,
      title: `${dataloggerName} - ${type === 'channels' ? 'Canales' : 'Alarmas'} (${itemCount})`
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalContent({
      isOpen: false,
      type: null,
      dataloggerId: null,
      title: ''
    });
  }, []);

  const getModalContent = () => {
    if (!modalContent.dataloggerId) return null;

    const items = modalContent.type === 'channels' 
      ? channels.filter(channel => channel.datalogger_id === modalContent.dataloggerId)
      : alarms.filter(alarm => 
          alarm.datalogger_id === modalContent.dataloggerId && 
          alarm.estado === 1
        );

    return (
      <div className={styles.modalContent}>
        <h2>{modalContent.title}</h2>
        <div className={styles.modalItems}>
          {items.map(item => (
            <CardBtnSmall
              key={modalContent.type === 'channels' ? item.canales_id : item.id}
              title={modalContent.type === 'channels' ? item.canales_nombre : item.nombre}
              url={`/panel/${modalContent.type}/${modalContent.type === 'channels' ? item.canales_id : item.id}`}
            />
          ))}
        </div>
      </div>
    );
  };

  const activeDataloggers = filterEntitiesByStatus(dataloggers);
  const filteredDataloggers = activeDataloggers.filter(datalogger => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      datalogger.nombre?.toLowerCase().includes(searchTermLower) ||
      datalogger.descripcion?.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='dataloggers' 
          itemsQty={filteredDataloggers.length}
          showAddButton={showAddButton}
        >
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Buscar dataloggers..."
          />
        </ButtonsBar>
      </div>

      <div className={styles.cardsContainer}>
        {filteredDataloggers.map(datalogger => (
          <CardInfo
            key={datalogger.id}
            iconSrc={`/icons/${getIconFileName('dataloggers')}`}
            title={datalogger.nombre}     
            url={`/panel/dataloggers/${datalogger.id}`}   
          >
            <div className={cardInfoStyles.description}>
              <p className={cardInfoStyles.paragraph}>
                <strong>{datalogger.descripcion}</strong>
              </p>
              {locations && (
                <p className={cardInfoStyles.paragraph}>                
                  Instalado en: {' '}
                  <CardBtnSmall 
                    title={locations.find(loc => loc.ubicaciones_id === datalogger.ubicacion_id || loc.id === datalogger.ubicacion_id)?.nombre || 'Sin ubicación'}
                    url={`/panel/ubicaciones/${datalogger.ubicacion_id}`}       
                  />       
                </p>
              )}
              
              <CardBtnSmall 
                title={`Canales conectados (${channels.filter(channel => 
                  channel.datalogger_id === datalogger.id
                ).length})`}
                onClick={() => openModal(
                  'channels', 
                  datalogger.id,
                  channels.filter(channel => channel.datalogger_id === datalogger.id).length,
                  datalogger.nombre
                )}
              />
              
              <CardBtnSmall 
                title={`Alarmas vigentes (${alarms.filter(alarm => 
                  alarm.datalogger_id === datalogger.id && 
                  alarm.estado === 1
                ).length})`}
                onClick={() => openModal(
                  'alarms', 
                  datalogger.id,
                  alarms.filter(alarm => 
                    alarm.datalogger_id === datalogger.id && 
                    alarm.estado === 1
                  ).length,
                  datalogger.nombre
                )}
              />
            </div>
          </CardInfo>
        ))}
      </div>

      <ReactModal
        isOpen={modalContent.isOpen}
        onRequestClose={closeModal}
        className={styles.modal}
        overlayClassName={styles.modalOverlay}
      >
        {getModalContent()}
        <button className={styles.closeButton} onClick={closeModal}>
          Cerrar
        </button>
      </ReactModal>
    </>
  );
};

export default ShowDataloggersCards;