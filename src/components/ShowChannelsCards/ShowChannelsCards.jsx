import React, {useState} from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import SearchBar from '../SearchBar/SearchBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowChannelsCards.module.css';
import cardInfoStyles from "../CardInfo/CardInfo.module.css";
import DigitalPorcentageOn from '../Graphics/DigitalPorcentageOn/DigitalPorcentageOn';
import AnalogData from '../Graphics/AnalogData/AnalogData';
import CustomTag from '../CustomTag/CustomTag';

const ShowChannelsCards = ({ 
  channels, 
  alarms, 
  searchTerm,
  onSearchChange,
  showAddButton = false 
}) => {

  const [showArchived, setShowArchived] = useState(false);
  

  const filteredChannels = channels
    .filter(channel => !showArchived ? channel?.is_active == 1 : true)
    .filter(channel => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      channel?.name.toLowerCase().includes(searchTermLower) ||
      channel?.description.toLowerCase().includes(searchTermLower)      
    );
  });  

  const timeRangesCards = [
    { hours: 1, label: '1 Hr' },
    { hours: 12, label: '12 Hrs' },
    { hours: 24, label: '24 Hrs' },
    { hours: 48, label: '2 Días' },
    { hours: 72, label: '3 Días' },    
  ];

  //console.log('Channels desde showchannelscards', channels);

  // Preparar los datos para el gráfico digital
  const prepareDigitalData = (data) => {
    if (!data || !data.length) return [];
    return data.map(point => ({
      timestamp: point.fecha,
      porcentaje_encendido: point.porcentaje_encendido,
      failure: point.tiempo_total >= 900 // 15 minutos en segundos
    }));
  };
  const oneChannel = channels[0];
  const dataloggerId = oneChannel ? oneChannel.uuid : null;
  const businessUuid = oneChannel ? oneChannel.business.uuid : null;
  //console.log(dataloggerId.datalogger_id);

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName={`ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales` }
          itemsQty={filteredChannels.length}
          showAddButton={showAddButton}
        >
        <div className={styles.controls}>
          { channels.length > 0 && (
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
              placeholder="Buscar canales..."
            />
          )}
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
        {filteredChannels.map(channel => {
          const channelAlarms = alarms.filter(
            alarm => alarm.channel_id == channel.uuid
          );

          return (
            <CardInfo
              key={channel.uuid}
              iconSrc={`/icons/${getIconFileName('canales')}`}
              title={channel.name}     
              url={`/panel/ubicaciones/${businessUuid}/dataloggers/${channel.datalogger_id}/canales/${channel.uuid}`}   
              size='large'
            >
            <div className={cardInfoStyles.cardContent}>
              <div className={cardInfoStyles.cardImage}>
                <img
                  src={channel?.img ? `${import.meta.env.VITE_IMAGE_URL}/${channel.img}` : '/images/default-channel.webp'}
                  alt={`Foto del canal ${channel?.name}`}
                  title={`Este es el canal ${channel?.name}`}
                  className={cardInfoStyles.image}
                  />
              </div>
              <div className={cardInfoStyles.description}>
                {
                  channel.is_active == 0 && (
                    <CustomTag 
                      text="Archivado"
                      type="archive"
                      icon="/icons/archive-solid.svg"
                    />
                  )
                }
                <p className={cardInfoStyles.paragraph}>                 
                  {channel.description}                  
                </p>
                <div className={styles.alarmsList}>
                  <p className={cardInfoStyles.paragraph}>
                    <strong>Alarmas configuradas ({alarms.filter(al => al.channel_uuid === channel.uuid).length}):</strong>
                  </p>
                  {alarms.length > 0 ? (
                    <ul className={styles.alarmItems}>
                      {alarms.filter(al => al.channel_uuid === channel.uuid)
                        .map(alarm => (
                        <li key={alarm.uuid} className={styles.alarmItem}>
                          <CardBtnSmall
                            title={alarm.name}
                            url={`/panel/ubicaciones/${businessUuid}/dataloggers/${channel.datalogger_id}/canales/${channel.uuid}/alarmas/${alarm.uuid}`}
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
            <div >
              {/*
              <div >               
                {channel.data && channel.data.length > 0 ? (
                  channel.nombre_columna.startsWith('d') ? (
                    <DigitalPorcentageOn
                      data={prepareDigitalData(channel.data)} 
                      currentChannelName={channel?.canales_nombre}
                      currentChannelTimeProm={channel?.tiempo_a_promediar} 
                      customTimeRanges={timeRangesCards}
                    />
                  ) : channel.nombre_columna.startsWith('a') ? (
                    <AnalogData
                      data={channel.data}
                      mult={channel.multiplicador} // Ajusta este valor según necesites
                    />
                  ) : (
                    <p className={cardInfoStyles.noData}>Tipo de canal no soportado</p>
                  )
                ) : (
                  <p className={cardInfoStyles.noData}>No hay datos disponibles</p>
                )}
              </div>
               <p className={cardInfoStyles.paragraph}>
                Este es el pie de pagina del grafico
              </p> */}
            </div>
            </CardInfo>
          );
        })}
      </div>
    </>
  );
};

export default ShowChannelsCards;