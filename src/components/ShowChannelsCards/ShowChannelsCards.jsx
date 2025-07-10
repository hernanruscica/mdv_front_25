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
  const uniqueAlarms = alarms.filter((alarm, index, self) =>
    index === self.findIndex((a) => a.id === alarm.id)
  ); 

  const filteredChannels = channels
    .filter(channel => !showArchived ? channel.estado == 1 : true)
    .filter(channel => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      channel.canales_nombre.toLowerCase().includes(searchTermLower) ||
      channel.canales_descripcion?.toLowerCase().includes(searchTermLower)      
    );
  });  

  const timeRangesCards = [
    { hours: 1, label: '1 Hr' },
    { hours: 12, label: '12 Hrs' },
    { hours: 24, label: '24 Hrs' },
    { hours: 48, label: '2 Días' },
    { hours: 72, label: '3 Días' },    
  ];

  //console.log(filteredChannels[0].data);

  // Preparar los datos para el gráfico digital
  const prepareDigitalData = (data) => {
    if (!data || !data.length) return [];
    return data.map(point => ({
      timestamp: point.fecha,
      porcentaje_encendido: point.porcentaje_encendido,
      failure: point.tiempo_total >= 900 // 15 minutos en segundos
    }));
  };

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar 
          itemsName='canales' 
          itemsQty={filteredChannels.length}
          showAddButton={showAddButton}
        >
        <div className={styles.controls}>
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            placeholder="Buscar canales..."
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
                {
                  channel.estado == 0 && (
                    <CustomTag 
                      text="Archivado"
                      type="archive"
                      icon="/icons/archive-solid.svg"
                    />
                  )
                }
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
            <div >
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
              {/* <p className={cardInfoStyles.paragraph}>
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