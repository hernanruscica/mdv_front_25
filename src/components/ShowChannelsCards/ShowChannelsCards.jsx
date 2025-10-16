import {useState} from 'react';
import CardInfo from '../CardInfo/CardInfo';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
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

  // Determine the base list of channels (active only, or all)
  const sourceChannels = showArchived ? channels : channels.filter(channel => channel.is_active == 1);

  // Filter the base list by the search term
  const channelsToShow = sourceChannels.filter(channel => {
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
  const dataloggerId = oneChannel ? oneChannel?.datalogger_id : null;
  const businessUuid = oneChannel ? oneChannel?.business.uuid : null;
 // console.log('channels', channels);
  //console.log('oneChannel', oneChannel);
  //console.log('showArchived', showArchived);

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
                  src={channel?.img ? `${channel.img}` : '/images/default-channel.webp'}
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
