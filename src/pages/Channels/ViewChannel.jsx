import React, {useState, useEffect} from 'react';
import { useParams, useNavigate, data } from 'react-router-dom';
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
import { useDataStore } from '../../store/dataStore';
import styles from './ViewChannel.module.css';
import cardInfoStyles from '../../components/CardInfo/CardInfo.module.css';
import DigitalPorcentagesOn from '../../components/Graphics/DigitalPorcentageOn/DigitalPorcentageOn';
import AnalogData from '../../components/Graphics/AnalogData/AnalogData';
import Gauge from '../../components/Gauge/Gauge';

import Table from '../../components/Table/Table';


const ViewChannel = () => {
  const { dataloggerId, channelId } = useParams()
  const [currentChannel, setCurrentChannel] = useState(null);
  const { fetchChannelById, loadingStates: { fetchChannel: isLoadingChannel }, errorChannel } = useChannelsStore();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const { fetchAlarmsByUser, fetchAlarmsByChannel, alarms, 
        loadingStates: { fetchAlarmsByUser: isLoadingAlarmsByUser, fetchAlarmsByChannel : isLoadingAlarmsByChannel }, error: errorAlarms } = useAlarmsStore();
  const { fetchDataChannel, dataChannel, loadingStates: {fetchData : isLoadingData} } = useDataStore();
  const [channelAlarms, setChannelAlarms] = useState([]);
  const [channelMainAlarm, setChannelMainAlarm] = useState(null); 
  const hoursBackView = 120; 

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
        //await fetchAlarmsByUser(user);
        await fetchAlarmsByChannel(currentChannel.id);
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

  useEffect(() => {
    const loadData = async () => {
      if (currentChannel) {
        // Ajusta los valores según tu lógica
        //console.log('canal:', currentChannel);
        const nombreTabla = currentChannel.datalogger_nombre_tabla;
        const nombreColumna = currentChannel.nombre_columna;
        const minutosAtras = hoursBackView * 60; // Asegúrate de definir hoursBackView
        const tiempoPromedio = currentChannel.tiempo_a_promediar;        
        await fetchDataChannel(nombreTabla, nombreColumna, minutosAtras, tiempoPromedio);
      }
    };
    loadData();
  }, [currentChannel]);

  /*
  useEffect(() => {
    if (dataChannel) {
      console.log('Datos del canal:', dataChannel);
    }
  }, [dataChannel]);
  */

  if (isLoadingChannel || isLoadingAlarmsByUser || isLoadingAlarmsByChannel || isLoadingData) {
    return <LoadingSpinner message="Cargando datos..." />;
  }

  if (errorChannel || errorAlarms) {
    return <div className={styles.error}>{errorChannel || errorAlarms}</div>;
  }

  //console.log('datos del canal:', dataChannel);
  //console.log('alarmas del canal:', alarms);

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
    { 
      label: 'NOMBRE ALARMA', 
      accessor: 'nombreAlarma',
      icon: '/icons/bell-regular.svg'
    },
    { 
      label: 'CANAL', 
      accessor: 'canal',
      icon: '/icons/code-branch-solid.svg'
    },
    { 
      label: 'TIPO', 
      accessor: 'tipo',
      icon: '/icons/flag-regular.svg'
    },
    { 
      label: 'CONDICION', 
      accessor: 'condicion',
      icon: '/icons/building-regular.svg'
    },   
    { 
      label: 'ESTADO', 
      accessor: 'estado',
      icon: '/icons/eye-regular.svg' 
    }
  ];  

  const handleAlarmClick = (row) => {
    navigate(`/panel/dataloggers/${currentChannel?.datalogger_id}/canales/${currentChannel?.id}/alarmas/${row.id}`);
  };

  const preparedAlarms = channelAlarms.map(alarm => ({
    nombreAlarma: alarm.nombre,
    canal: alarm?.canal_nombre || 'Sin canal',
    tipo: alarm.tipo_alarma,  
    condicion: alarm.condicion || 'Sin condición',
    estado: alarm.estado,
    url: `/panel/dataloggers/${dataloggerId}/canales/${channelId}/alarmas/${alarm.id}`,  
    id: alarm.id
  }));

  //console.log(dataChannel)

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
              {(channelMainAlarm.tipo_alarma == "PORCENTAJE_ENCENDIDO") ?
                (() => {
                  const conditionOperator = channelMainAlarm.condicion.split(" ")[1];
                  const conditionValue = channelMainAlarm.condicion.split(" ")[2];  
                  const max = (conditionOperator.includes(">")) ? conditionValue : 100;
                  const min = (conditionOperator.includes("<")) ? conditionValue : 0;
                  return (
                    <Gauge 
                      currentValue= {dataChannel && dataChannel.length > 0 ? dataChannel[dataChannel.length - 1][channelMainAlarm.nombre_variables] : 0}
                      alarmMin={min}
                      alarmMax={max}                              
                    />
                  )
                })()
                 : <strong>{`Ultimo valor medido : `}</strong>                
              }        
        
            </div>
          </div>
        </CardInfo>
        }
      </div>

      <div className={styles.chartContainer}>
       {/*  {(dataChannel && dataChannel.length > 0) &&
         <DigitalPorcentagesOn 
          data={dataChannel}
          currentChannelName={currentChannel?.nombre}
          currentChannelTimeProm={currentChannel?.tiempo_a_promediar}                  
        />}*/}
       
       {dataChannel && dataChannel.length > 0 ? (
          currentChannel?.nombre_columna.startsWith('d') ? (
            <DigitalPorcentagesOn
              data={dataChannel} 
              currentChannelName={currentChannel?.nombre}
              currentChannelTimeProm={currentChannel?.tiempo_a_promediar} 
            />
          ) : currentChannel?.nombre_columna.startsWith('a') ? (
            <AnalogData
              data={dataChannel}
              mult={currentChannel?.multiplicador} // Ajusta este valor según necesites
            />
          ) : (
            <p className={cardInfoStyles.noData}>Tipo de canal no soportado</p>
          )
        ) : (
          <p className={cardInfoStyles.noData}>No hay datos disponibles</p>
        )}

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