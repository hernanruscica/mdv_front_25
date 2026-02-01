import {useState, useEffect} from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowChannelsCards.module.css';
import cardInfoStyles from "../CardInfo/CardInfo.module.css";
import CustomTag from '../CustomTag/CustomTag';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';


const ShowChannelsCards = ({ 
  channels, 
  alarms, 
  searchTerm,
  onSearchChange,
  showAddButton = false 
}) => {

  const [showArchived, setShowArchived] = useState(false);  

 if (!channels) {
  return <LoadingSpinner message="Cargando datos..." />;
}

  // Determine the base list of channels (active only, or all)
  const sourceChannels = showArchived && channels ? channels : channels.filter(channel => channel.is_active == 1);

  // Filter the base list by the search term
  const channelsToShow = (sourceChannels) ? sourceChannels.filter(channel => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      channel?.name.toLowerCase().includes(searchTermLower) ||
      channel?.description.toLowerCase().includes(searchTermLower)
    );
  })
  : [];


  const oneChannel = channels ? channels[0] : undefined;
  const dataloggerId = oneChannel ? oneChannel?.datalogger_id : null;
  const businessUuid = oneChannel ? oneChannel?.business.uuid : null;  
  //console.log('channels', channels);
  

  return (
    <>
      <div className={styles.controlsContainer}>
        <ButtonsBar
          itemsName='canales'
          items={channels}
          filteredItems={channelsToShow}
          showAddButton={showAddButton}
          addLink={`ubicaciones/${businessUuid}/dataloggers/${dataloggerId}/canales`}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          showArchived={showArchived}
          onShowArchivedChange={setShowArchived}
        />
      </div>

      <div className={styles.cardsContainer}>
        {channelsToShow.map(channel => {
          const channelAlarms = alarms.filter(
            alarm => alarm.channel_id == channel.uuid
          );

          //console.log('channel 0', channels[0]);
          

          return (
            <CardInfo
              key={channel.uuid}
              iconSrc={`/icons/${getIconFileName('canales')}`}
              title={channel.name}     
              url={`/panel/ubicaciones/${businessUuid}/dataloggers/${channel.datalogger_id}/canales/${channel.uuid}`}   
              size='normal'
            >
            <div className={cardInfoStyles.cardContent}>
              <div className={cardInfoStyles.cardImage}>
                <img
                  src={channel?.img  ? `${channel.img}` : '/images/default-channel.webp'}
                  alt={`Foto del canal ${channel?.name}`}
                  title={`Este es el canal ${channel?.name}`}
                  className={cardInfoStyles.image}
                  />
              </div>
              <div className={cardInfoStyles.description}>
                {
                  channel.is_active == '0' && (
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
{/*                 
                <p className={cardInfoStyles.paragraph}>
                  <strong>Total horas de uso:</strong>{" "} {channel?.totalData.total_time_on_hours} Hs. <br/> 
                  Con datos desde <strong>{FormatearFechaCompleta(channel?.totalData.first_date)}</strong>:
                </p>
                 */}
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


