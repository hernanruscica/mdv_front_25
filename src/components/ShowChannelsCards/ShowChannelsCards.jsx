import React from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import SearchBar from '../SearchBar/SearchBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowChannelsCards.module.css';
import cardInfoStyles from "../CardInfo/CardInfo.module.css";

const ShowChannelsCards = ({ 
  channels, 
  alarms, 
  searchTerm,
  onSearchChange,
  showAddButton = false 
}) => {
  // Validación inicial para eliminar duplicados
  const uniqueChannels = channels.filter((channel, index, self) =>
    index === self.findIndex((c) => c.canales_id === channel.canales_id)
  );

  const uniqueAlarms = alarms.filter((alarm, index, self) =>
    index === self.findIndex((a) => a.id === alarm.id)
  );

  const filteredChannels = uniqueChannels.filter(channel => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      channel.canales_nombre.toLowerCase().includes(searchTermLower) ||
      channel.canales_descripcion?.toLowerCase().includes(searchTermLower)      
    );
  });

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='canales' 
          itemsQty={filteredChannels.length}
          showAddButton={showAddButton}
        >
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Buscar canales..."
          />
        </ButtonsBar>
      </div>

      <div className={styles.cardsContainer}>
        {filteredChannels.map(channel => {
          const channelAlarms = uniqueAlarms.filter(
            alarm => alarm.canal_id == channel.canales_id
          );

          return (
            <CardInfo
              key={channel.canales_id}
              iconSrc={`/icons/${getIconFileName('canales')}`}
              title={channel.canales_nombre}     
              url={`/panel/dataloggers/${channel.datalogger_id}/canales/${channel.canales_id}`}   
              size='large'
            >
            <div className={cardInfoStyles.cardContent}>
              <div className={cardInfoStyles.cardImage}>
                <img
                  src={channel?.foto ? `${import.meta.env.VITE_IMAGE_URL}/${channel.foto}` : '/images/default-channel.webp'}
                  alt={`Foto del canal ${channel?.canales_nombre}`}
                  title={`Este es el canal ${channel?.canales_nombre}`}
                  className={cardInfoStyles.image}
                  />
              </div>
              <div className={cardInfoStyles.description}>
                <p className={cardInfoStyles.paragraph}>                 
                  {channel.canales_descripcion}                  
                </p>
                <div className={styles.alarmsList}>
                  <p className={cardInfoStyles.paragraph}>
                    <strong>Alarmas configuradas ({channelAlarms.length}):</strong>
                  </p>
                  {channelAlarms.length > 0 ? (
                    <ul className={styles.alarmItems}>
                      {channelAlarms.map(alarm => (
                        <li key={alarm.id} className={styles.alarmItem}>
                          <CardBtnSmall
                            title={alarm.nombre}
                            url={`/panel/dataloggers/${channel.datalogger_id}/canales/${channel.canales_id}/alarmas/${alarm.id}`}
                          />
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className={styles.noAlarms}>No hay alarmas configuradas</p>
                  )}
                </div>
                <p className={cardInfoStyles.paragraph}>
                  <strong>Total horas de uso:</strong>{" "} {Math.floor(channel.horas_uso)} Hs. <br/> 
                  Con datos desde <strong>{new Date(channel.fecha_creacion).toLocaleDateString('es-ES', {day: '2-digit', month: '2-digit', year: 'numeric'})}</strong>:
                </p>
              </div>
            </div>
            <div className={cardInfoStyles.cardGraphic}>
              <div className={cardInfoStyles.graphicContainer}>
                Graphic placeholder                
              </div>
              <p className={cardInfoStyles.paragraph}>
                Este es el pie de pagina del grafico
              </p>
            </div>
            </CardInfo>
          );
        })}
      </div>
    </>
  );
};

export default ShowChannelsCards;