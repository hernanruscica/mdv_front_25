import React, { useState } from 'react';
import ReactModal from 'react-modal';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import SearchBar from '../SearchBar/SearchBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowDataloggersCards.module.css';
import cardInfoStyles from '../CardInfo/CardInfo.module.css';
import CustomTag from '../CustomTag/CustomTag';

const ShowDataloggersCards = ({ 
  dataloggers, 
  channels, 
  alarms, 
  locations,
  showAddButton = false 
}) => {
  const [showArchived, setShowArchived] = useState(showAddButton);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    type: null,
    dataloggerId: null,
    itemsCount: 0,
    dataloggerName: ''
  });

  const openModal = (type, dataloggerId, itemsCount, dataloggerName) => {
    setModalContent({
      isOpen: true,
      type,
      dataloggerId,
      itemsCount,
      dataloggerName
    });
  };

  const closeModal = () => {
    setModalContent({
      isOpen: false,
      type: null,
      dataloggerId: null,
      itemsCount: 0,
      dataloggerName: ''
    });
  };

  const getModalContent = () => {
    if (!modalContent.type || !modalContent.dataloggerId) return null;

    const items = modalContent.type === 'channels' 
      ? channels.filter(channel => channel.datalogger_id === modalContent.dataloggerId)
      : alarms.filter(alarm => 
          alarm.datalogger_id === modalContent.dataloggerId && 
          alarm.estado === 1
        );

    return (
      <div className={styles.modalContent}>
        <h2>{modalContent.type === 'channels' ? 'Canales' : 'Alarmas'} de {modalContent.dataloggerName}</h2>
        {items.length > 0 ? (
          <ul className={styles.modalList}>
            {items.map(item => (
              <li key={item.id} className={styles.modalItem}>
                <CardBtnSmall
                  title={modalContent.type === 'channels' ? item.canales_nombre : item.nombre}
                  url={modalContent.type === 'channels' 
                    ? `/panel/dataloggers/${modalContent.dataloggerId}/canales/${item.canales_id}`
                    : `/panel/dataloggers/${modalContent.dataloggerId}/canales/${item.canal_id}/alarmas/${item.id}`
                  }
                />
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay {modalContent.type === 'channels' ? 'canales' : 'alarmas'} para mostrar</p>
        )}
      </div>
    );
  };

  const filteredDataloggers = dataloggers
    .filter(datalogger => !showArchived ? datalogger.estado === 1 : true)
    .filter(datalogger => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        datalogger.nombre.toLowerCase().includes(searchTermLower) ||
        datalogger.descripcion?.toLowerCase().includes(searchTermLower)
      );
    });

    //console.log(locations)

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='dataloggers' 
          itemsQty={filteredDataloggers.length}
          showAddButton={showAddButton}
        >
          <div className={styles.controls}>
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Buscar dataloggers..."
            />
            {showAddButton && (
              <label className={styles.checkboxContainer}>
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={(e) => setShowArchived(e.target.checked)}
                />
                <span>Mostrar también los archivados</span>
              </label>
            )}
          </div>
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
              {
                datalogger.estado === 0 && (
                  <CustomTag 
                    text="Archivado"
                    type="archive"
                    icon="/icons/archive-solid.svg"
                  />
                )
              }
              <p className={cardInfoStyles.paragraph}>
                <strong>{datalogger.descripcion}</strong>
              </p>
              {locations && (
                <p className={cardInfoStyles.paragraph}>                
                  Instalado en: {' '}
                  <CardBtnSmall 
                    title={locations.find(loc => loc?.ubicaciones_id === datalogger.ubicacion_id || loc?.id === datalogger.ubicacion_id)?.ubicaciones_nombre || 
                           locations.find(loc => loc?.ubicaciones_id === datalogger.ubicacion_id || loc?.id === datalogger.ubicacion_id)?.nombre || 
                           'Sin ubicación'}
                    url={`/panel/ubicaciones/${datalogger.ubicacion_id}`}       
                  />       
                </p>
              )}
              
              <CardBtnSmall 
                title={`Canales conectados (${channels?.filter(channel => 
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
        
        <BtnCallToAction 
          text="Cerrar ventana"
          icon="times-solid.svg"
          onClick={closeModal}
        />
      </ReactModal>
    </>
  );
};

export default ShowDataloggersCards;