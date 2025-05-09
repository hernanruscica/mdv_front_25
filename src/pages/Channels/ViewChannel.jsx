import React, {useState, useEffect} from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import  CardImage  from '../../components/CardImage/CardImage';
import  CardInfo  from '../../components/CardInfo/CardInfo';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import CardBtnSmall from '../../components/CardBtnSmall/CardBtnSmall';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useAuthStore } from '../../store/authStore';
import styles from './ViewChannel.module.css';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';

import Table from '../../components/Table/Table';

const ViewChannel = () => {
  const { dataloggerId, channelId } = useParams()
  const [currentChannel, setCurrentChannel] = useState(null);
  const { fetchChannelById, loadingStates: { fetchChannel: isLoadingChannel }, errorChannel } = useChannelsStore();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { fetchAlarmsByUser, alarms, loadingStates: { fetchAlarmsByUser: isLoadingAlarms }, error: errorAlarms } = useAlarmsStore();
  const [channelAlarms, setChannelAlarms] = useState([]);
  const [channelMainAlarm, setChannelMainAlarm] = useState(null); 

  useEffect(() => {
    const loadChannel = async () => {
      const channel = await fetchChannelById(channelId);
      setCurrentChannel(channel);
    };
  
    if (channelId) {
      loadChannel();
    }
  }, [channelId]);

  useEffect(() => {
    const loadAlarms = async () => {
      if (user && currentChannel) {
        await fetchAlarmsByUser(user);
      }
    };
    loadAlarms();
  }, [user, currentChannel]);

  useEffect(() => {
    if (alarms && currentChannel) {
      const filteredAlarms = alarms.filter(alarm => alarm.canal_id === currentChannel.id);
      setChannelAlarms(filteredAlarms);
      setChannelMainAlarm(filteredAlarms[0] || null);
    }
  }, [alarms, currentChannel]);

  if (isLoadingChannel || isLoadingAlarms) {
    return <LoadingSpinner message="Cargando detalles del canal..." />;
  }

  if (errorChannel || errorAlarms) {
    return <div className={styles.error}>{errorChannel || errorAlarms}</div>;
  }

  const channelButtons = (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        url={`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/archivar`}
      />
    </>
  );

  const columns = [
    { label: 'NOMBRE DE LA ALARMA', accessor: 'nombreAlarma' },
    { label: 'NOMBRE DEL CANAL', accessor: 'nombreCanal' },
    { label: 'CONDICIÓN', accessor: 'condicion' }
  ];

  const handleAlarmClick = (row) => {
    navigate(`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/alarmas/${row.id}`);
  };

  const preparedAlarms = channelAlarms.map(alarm => ({
    nombreAlarma: alarm.nombre,
    nombreCanal: currentChannel?.nombre || 'Canal no encontrado',
    condicion: alarm.condicion || 'Sin condición',
    id: alarm.id
  }));

  //console.log(channelAlarms)

  return (
    <>
      <Title1 type="canales" text={`Canal ${currentChannel?.nombre}`}/>
      <Breadcrumb datalogger={currentChannel?.datalogger_nombre} canal={currentChannel?.nombre}/>
      
      <div className={styles.cardsContainer}>
        <CardImage
          image={`${import.meta.env.VITE_IMAGE_URL}/${currentChannel?.foto}`}
          title={currentChannel?.nombre}
          buttons={channelButtons}
        >
          <div className={styles.channelInfo}>
            <p>Pertenece al datalogger : 
              <CardBtnSmall 
                title={currentChannel?.datalogger_nombre}
                url={`/panel/dataloggers/${currentChannel?.datalogger_id}`}
              />
            </p>
            <p><strong>Descripción:</strong> {currentChannel?.descripcion}</p>
            <p><strong>Total de Hs de Uso:</strong>### Hs. <br/>
              con datos desde <strong>{currentChannel?.fecha_creacion ? new Date(currentChannel.fecha_creacion).toLocaleDateString() : 'No disponible'}</strong>
            </p>
            <p><strong>Alarmas programadas:</strong> 
              {channelAlarms && channelAlarms.length > 0 ? (
                <CardBtnSmall 
                  title={`Ver ${channelAlarms.length} alarma/s`} 
                  url={`/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas`}/>
              ) : (
                <span className={styles.noAlarms}>No hay alarmas configuradas</span>
              )}
            </p>
            
          </div>
        </CardImage>
        { (channelAlarms && channelAlarms.length > 0) &&
        <CardInfo
          iconSrc="/icons/bell-regular.svg"
          title={`${channelMainAlarm?.nombre || 'Sin alarma configurada'}`}
          url={channelMainAlarm ? `/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/alarmas/${channelAlarms[0].id}` : '#'}
        >
          <div className={cardInfoStyles.description}>            
            <p><strong>Creado el:</strong> {new Date(channelMainAlarm?.fecha_creacion).toLocaleDateString()}</p>
            <p><strong>Descripcion: </strong>{channelMainAlarm?.descripcion}</p>
            <p><strong>Condicion: </strong>{channelMainAlarm?.condicion}</p>
            <div className={styles.gaugePlaceholder}>
              {/* Placeholder para el gráfico gauge */}
              <div className={styles.gaugeDemo}>Gauge Chart</div>
            </div>
          </div>
        </CardInfo>
        }
      </div>

      <div className={styles.chartContainer}>
        {/* Placeholder para el gráfico de datos */}
        <div className={styles.chartPlaceholder}>
          Gráfico de datos históricos
        </div>
      </div>

      <Title2 text="Alarmas Configuradas" type="alarmas"/>

      {/*Si es propietario puede agregar alarmas al canal */
      (user.espropietario == 1) &&      
       <BtnCallToAction
            text="Agregar alarma"
            icon="plus-circle-solid.svg"
            type="normal"
            url={`/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/agregar`}
        />
      }
    { (channelAlarms && channelAlarms.length > 0) ?
      <div className={styles.tableContainer}>
        <Table 
          columns={columns}
          data={preparedAlarms}
          onRowClick={handleAlarmClick}
        />
      </div>
      : <p>{`El canal ${currentChannel?.nombre} todavia no tiene alarmas programadas.`}</p>
    }
    </>
  );
};

export default ViewChannel;