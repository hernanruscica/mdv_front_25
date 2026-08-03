import { useState, useMemo } from 'react';
import CardInfo from '../CardInfo/CardInfo';
import ButtonsBar from '../ButtonsBar/ButtonsBar';
import { getIconFileName } from "../../utils/iconsDictionary";
import styles from './ShowChannelsCards.module.css';
import CustomTag from '../CustomTag/CustomTag';
import { LoadingSpinner } from '../LoadingSpinner/LoadingSpinner';
import ChannelMiniChart from '../ChannelMiniChart/ChannelMiniChart';
import AlarmLinkCard from '../AlarmLinkCard/AlarmLinkCard';

const ShowChannelsCards = ({
  channels,
  alarms = [],
  dataloggerUsage = null,
  searchTerm,
  onSearchChange,
  showAddButton = false,
  maintenanceLogs = []
}) => {
  const [showArchived, setShowArchived] = useState(false);

  const pendingTasksByChannel = useMemo(() => {
    if (!maintenanceLogs || maintenanceLogs.length === 0) return {};

    const today = new Date().toISOString().split('T')[0];
    const result = {};

    maintenanceLogs.forEach(log => {
      if (log.type !== 'task') return;

      const isPending = log.status === 'pending' ||
                       (log.scheduled_date && log.scheduled_date > today);

      if (isPending && log.channel_uuid) {
        result[log.channel_uuid] = (result[log.channel_uuid] || 0) + 1;
      }
    });

    return result;
  }, [maintenanceLogs]);

  if (!channels) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  const sourceChannels = showArchived && channels ? channels : channels.filter(channel => channel.is_active == 1);

  const channelsToShow = sourceChannels.filter(channel => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      channel?.name.toLowerCase().includes(searchTermLower) ||
      channel?.description.toLowerCase().includes(searchTermLower)
    );
  });

  const oneChannel = channels[0];
  const dataloggerId = oneChannel ? oneChannel?.datalogger_id : null;
  const businessUuid = oneChannel ? oneChannel?.business.uuid : null;

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
        {channelsToShow.map(channel => (
          <CardInfo
            key={channel.uuid}
            iconSrc={`/icons/${getIconFileName('canales')}`}
            title={channel.name}
            url={`/panel/ubicaciones/${businessUuid}/dataloggers/${channel.datalogger_id}/canales/${channel.uuid}`}
            size='normal'
          >
            <div className={styles.cardGrid}>
              <div className={styles.cardInfoCol}>
                <div className={styles.cardImageWrap}>
                  <img
                    src={channel?.img ? `${channel.img}` : '/images/default-channel.webp'}
                    alt={`Foto del canal ${channel?.name}`}
                    title={`Este es el canal ${channel?.name}`}
                    className={styles.cardImage}
                  />
                </div>
                <div className={styles.cardBody}>
                  {channel.is_active == '0' && (
                    <CustomTag
                      text="Archivado"
                      type="archive"
                      icon="/icons/archive-solid.svg"
                    />
                  )}
                  <p className={styles.cardDescription}>{channel.description}</p>
                </div>
                {pendingTasksByChannel[channel.uuid] > 0 && (
                  <div className={styles.pendingTasksBadge}>
                    <img src="/icons/person-digging-solid.svg" alt="" />
                    <span>{pendingTasksByChannel[channel.uuid]} tareas pendientes</span>
                  </div>
                )}
                <div className={styles.alarmCardsList}>
                  {alarms
                    .filter(alarm => alarm.channel_uuid === channel.uuid)
                    .filter(alarm => alarm.is_active === 1 && alarm.alarm_type === 'porcentage_on')
                    .map(alarm => {
                      const currentChannel = dataloggerUsage?.channels?.find(ch => ch.uuid == alarm?.channel_uuid);
                      const currentValue = currentChannel?.lastData?.porcentageUsagePeriod || '--';

                      let currentMin = null;
                      let currentMax = null;
                      if (alarm?.condition_logic?.includes('>')) {
                        currentMin = 0;
                        currentMax = alarm?.var01;
                      } else {
                        currentMin = alarm?.var01;
                        currentMax = 100;
                      }

                      return (
                        <AlarmLinkCard
                          key={alarm.uuid}
                          alarm={alarm}
                          currentValue={currentValue}
                          currentMin={currentMin}
                          currentMax={currentMax}
                        />
                      );
                    })}
                </div>
              </div>
              <div className={styles.cardChartCol}>
                <ChannelMiniChart
                  businessUuid={businessUuid}
                  channelUuid={channel.uuid}
                />
              </div>
            </div>
          </CardInfo>
        ))}
      </div>
    </>
  );
};

export default ShowChannelsCards;
