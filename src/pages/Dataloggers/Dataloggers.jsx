import React, { useEffect, useState, useCallback } from 'react';
import { Title1 } from '../../components/Title1/Title1';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import CardInfo from '../../components/CardInfo/CardInfo';
import { useAuthStore } from '../../store/authStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { filterEntitiesByStatus } from '../../utils/entityFilters';
import styles from './Dataloggers.module.css';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';
import { getIconFileName } from "../../utils/iconsDictionary";
import ButtonsBar from '../../components/ButtonsBar/ButtonsBar';
import SearchBar from '../../components/SearchBar/SearchBar';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import ReactModal from 'react-modal';

// Add these imports
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
// Add useLocationsStore to the imports
import { useLocationsStore } from '../../store/locationsStore';

const Dataloggers = () => {
  // Group all useState hooks at the top
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState({});
  const [modalContent, setModalContent] = useState({
    isOpen: false,
    type: null,
    dataloggerId: null,
    title: ''
  });
  
  // Store hooks
  const user = useAuthStore(state => state.user);
  const { 
    dataloggers, 
    loadingStates: { fetchDataloggers: isLoading }, 
    error,
    fetchDataloggers 
  } = useDataloggersStore();

  const {
    channels,
    loadingStates: { fetchChannels: isLoadingChannels },
    fetchChannels
  } = useChannelsStore();

  const {
    alarms,
    loadingStates: { fetchAlarms: isLoadingAlarms },
    fetchAlarms
  } = useAlarmsStore();

  const {
    locations,
    loadingStates: { fetchLocations: isLoadingLocations },
    fetchLocations
  } = useLocationsStore();

 
  // Update the openModal parameters to include dataloggerName
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

  useEffect(() => {
    if (!dataloggers || dataloggers.length === 0) {
      fetchDataloggers(user);
    }
    if (!channels || channels.length === 0) {
      fetchChannels(user);
    }
    if (!alarms || alarms.length === 0) {
      fetchAlarms(user);
    }
    if (!locations || locations.length === 0) {
      fetchLocations(user);
    }
  }, [user]);

  if (isLoading || isLoadingChannels || isLoadingAlarms || isLoadingLocations) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  const activeDataloggers = filterEntitiesByStatus(dataloggers);

  const filteredDataloggers = activeDataloggers.filter(datalogger => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      datalogger.nombre?.toLowerCase().includes(searchTermLower) ||
      datalogger.descripcion?.toLowerCase().includes(searchTermLower)
    );
  });

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

  return (
    <>
      <Title1 
        type="dataloggers"
        text="Dataloggers" 
      />
      <Breadcrumb />
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='dataloggers' 
          itemsQty={filteredDataloggers.length}
          showAddButton={user.espropietario === 1}
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
              <p className={cardInfoStyles.paragraph}>                
                Instalado en: {' '}
                <CardBtnSmall 
                  title={locations.find(loc => loc.ubicaciones_id === datalogger.ubicacion_id)?.ubicaciones_nombre || 'Sin ubicación'}
                  url={`/panel/ubicaciones/${datalogger.ubicacion_id}`}       
                />       
              </p>
              
              <CardBtnSmall 
                title={`Canales conectados (${(channels || []).filter(channel => 
                  channel.datalogger_id === datalogger.id
                ).length})`}
                onClick={() => openModal(
                  'channels', 
                  datalogger.id,
                  (channels || []).filter(channel => channel.datalogger_id === datalogger.id).length,
                  datalogger.nombre
                )}
              />
              
              <CardBtnSmall 
                title={`Alarmas vigentes (${(alarms || []).filter(alarm => 
                  alarm.datalogger_id === datalogger.id && 
                  alarm.estado === 1
                ).length})`}
                onClick={() => openModal(
                  'alarms', 
                  datalogger.id,
                  (alarms || []).filter(alarm => 
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

export default Dataloggers;