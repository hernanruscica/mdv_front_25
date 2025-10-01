import { useState } from 'react';
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
    const channels = dataloggers.flatMap(d => d.channels); 
    const alarms = dataloggers.flatMap(d => d.alarms); 
    if (!modalContent.type || !modalContent.dataloggerId) return null;
    const currentChannels = channels.filter(channel => channel.datalogger_id === modalContent.dataloggerId);
    const items = modalContent.type === 'channels' 
      ? channels.filter(channel => channel.datalogger_id === modalContent.dataloggerId)      
      : alarms.filter(alarm => alarm.is_active === 1 && currentChannels.some(ch => ch.uuid === alarm.channel_uuid));      
    console.log('items',items)
    return (
      <div className={styles.modalContent}>
        <h2>{modalContent.type === 'channels' ? 'Canales' : 'Alarmas'} de {modalContent.dataloggerName}</h2>
        {items.length > 0 ? (
          <ul className={styles.modalList}>
            {items.map(item => (
              <li key={item.uuid} className={styles.modalItem}>
                <CardBtnSmall
                  title={modalContent.type === 'channels' ? item.name : item.name}
                  url={modalContent.type === 'channels' 
                    ? `/panel/ubicaciones/${item.business.uuid}/dataloggers/${modalContent.dataloggerId}/canales/${item.uuid}`
                    : `/panel/ubicaciones/${item.business.uuid}/dataloggers/${modalContent.dataloggerId}/canales/${item.channel_uuid}/alarmas/${item.uuid}`
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
    .filter(datalogger => !showArchived ? datalogger.is_active === 1 : true)
    .filter(datalogger => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        datalogger?.name.toLowerCase().includes(searchTermLower) ||
        datalogger?.description?.toLowerCase().includes(searchTermLower)
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
            key={datalogger.uuid}
            iconSrc={`/icons/${getIconFileName('dataloggers')}`}
            title={datalogger.name}     
            url={`/panel/ubicaciones/${datalogger.business.uuid}/dataloggers/${datalogger.uuid}`}   
          >
            <div className={cardInfoStyles.description}>
              {
                datalogger.is_active === 0 && (
                  <CustomTag 
                    text="Archivado"
                    type="archive"
                    icon="/icons/archive-solid.svg"
                  />
                )
              }
              <p className={cardInfoStyles.paragraph}>
                <strong>{datalogger.description}</strong>
              </p>
              
                <p className={cardInfoStyles.paragraph}>                
                  Instalado en: 
                  <CardBtnSmall 
                    title={datalogger.business.name}
                    url={`/panel/ubicaciones/${datalogger.business.uuid}`}       
                  />       
                </p>
              
              {/* (type, dataloggerId, itemsCount, dataloggerName) */}
              <CardBtnSmall 
                title={`Canales conectados (${datalogger?.channels.length  || 0})`}
                onClick={() => openModal(
                  'channels', 
                  datalogger?.uuid,
                  datalogger?.channels.length || 0,
                  datalogger?.name
                )}
              />
              
              <CardBtnSmall 
                title={`Alarmas vigentes (${datalogger?.alarms.filter(alarm => alarm.is_active === 1).length})`}
                onClick={() => openModal(
                  'alarms', 
                  datalogger?.uuid,
                  datalogger?.alarms.filter(alarm => alarm?.is_active == 1).length,
                  datalogger.name
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