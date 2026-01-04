import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import { Title1 } from '../../components/Title1/Title1';
import { Title2 } from '../../components/Title2/Title2';
import CardImage from '../../components/CardImage/CardImage';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import styles from './ViewChannel.module.css';
import CustomTag from '../../components/CustomTag/CustomTag';
import ModalSetArchive from '../../components/ModalSetArchive/ModalSetArchive';
import ChannelInfo from '../../components/ChannelInfo/ChannelInfo';
import ChannelAlarms from '../../components/ChannelAlarms/ChannelAlarms';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useDataStore } from '../../store/dataStore';
import ViewChart from '../../components/ViewChart/ViewChart';
import { RANGE_KEYS } from '../../components/ViewChart/constants/chartRanges';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';

const ViewChannel = () => {
  const { businessUuid, dataloggerId, channelId } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);
  const [modalOpen, setModalOpen] = useState(false);  

   
  const { fetchChannelById, 
          selectedChannel, 
          loadingStates: { fetchChannel: isLoadingChannel, updateChannel: isUpdatingChannel },
          error: erroChannel
        } = useChannelsStore();

  const { alarms,
          fetchAlarmsByChannel,
          loadingStates : {
            fetchAlarmsByChannel : isLoadingAlarmsByChannel
          },
          error : errorLoadindAlarms
        } = useAlarmsStore();

  const { fetchAllRegistersChannelData, fetchDailyChannelData, fetchWeeklyChannelData,
          fetchChannelUsage, fetchDataloggerUsage,
          channelAllRegistersData, channelDailyData, channelWeeklyData,
          channelUsage, dataloggerUsage,
          loadingStates: { 
            fetchAllRegistersChannelData: isLoadingAllRegisters,
            fetchDailyChannelData: isLoadingDailyData,
            fetchWeeklyChannelData: isLoadingWeeklyData,
            fetchChannelUsage: isLoadingChannelUsage, fetchDataloggerUsage: isLoadingDataloggerUsage,
          },
          error: errorLoadingAllRegisters
        } = useDataStore();


  useEffect(() => {

    const loadData = async () => {
      if (businessUuid, channelId){
        const currentChannel = await fetchChannelById(channelId, businessUuid);
        await fetchAlarmsByChannel(businessUuid, channelId);
        await fetchAllRegistersChannelData(channelId, '2025-12-12', '2025-12-13');
        await fetchDailyChannelData(channelId, '2025-12-12', '2025-12-24');
        await fetchWeeklyChannelData(channelId, '2025-12-12', '2026-01-03');
        await fetchChannelUsage(currentChannel?.datalogger.uuid, channelId);
        await fetchDataloggerUsage(currentChannel?.datalogger.uuid);
      }
    }
    loadData();
  }, [businessUuid, channelId]);


  if (isLoadingChannel || isUpdatingChannel || isLoadingAlarmsByChannel 
      || isLoadingAllRegisters || isLoadingDailyData || isLoadingWeeklyData
      || isLoadingChannelUsage || isLoadingDataloggerUsage) {
    return <LoadingSpinner message="Cargando datos..." />;
    }
    
  if (erroChannel) {
    return <div className={styles.error}>{erroChannel}</div>;
    }
  

const handleAlarmClick = (row) => {
  navigate(`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger.uuid}/canales/${selectedChannel?.uuid}/alarmas/${row.id}`);
}; 

const userCurrentRole = 
    user?.businesses_roles.some(br => br.role === 'Owner')
      ? 'Owner'
      : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;




const seletedChannelAlarms = alarms.filter(al => al.channel_uuid === selectedChannel?.uuid);
      
  const channelButtons = (selectedChannel?.is_active == '1') ? (
    <>
      <BtnCallToAction
        text="Editar"
        icon="edit-regular.svg"
        type="warning"
        url={`/panel/ubicaciones/${selectedChannel?.business_uuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/${selectedChannel?.uuid}/editar`}
      />
      <BtnCallToAction
        text="Archivar"
        icon="archive-solid.svg"
        type="danger"
        onClick={() => setModalOpen(true)}
      />
    </>
  ) : (
    <>
      <BtnCallToAction
        text="Desarchivar"
        icon="archive-solid.svg"
        type="normal"
        onClick={() => setModalOpen(true)}
      />
      
    </>
  );
    
  //console.log('selectedChannel', selectedChannel);
  //console.log('alarms by channel', seletedChannelAlarms);  channelDailyData, channelWeeklyData
  //console.log('channelUsage :', channelUsage?.totalData.total_time_on_hours);
  
  
  return (
    <>
    <ModalSetArchive
        isOpen={modalOpen}
        onRequestClose={() => setModalOpen(false)}
        entidad="canal"
        entidadId={selectedChannel?.uuid}
        nuevoEstado={selectedChannel?.is_active == '1' ? 0 : 1}       
        redirectTo={`/panel/ubicaciones/${businessUuid}/dataloggers/${selectedChannel?.datalogger_id}/canales/`}
        nombre={`${selectedChannel?.name}`}
        businessUuid={businessUuid}
      />     
      <Title1 type="canales" text={`Canal ${selectedChannel?.name}`}/>
      {
        userCurrentRole == 'Owner'
        ? <>
          <p className={styles.description}>
            Usted se encuentra en la pagina para ver mas detalles del canal seleccionado.<br/><br/>
            Como  <strong>propietario, usted tiene acceso completo para administrar </strong> todas las ubicaciones, usuarios y dataloggers en el sistema.<br/><br/>
            En esta pagina puede: <strong> Agregar nuevas alarmas, editar y/o archivar el canal</strong> actual. <br/><br/>
            Un canal puede tener varias alarmas, de distintos tipos asociadas.<br/><br/>
            Puede buscar una alarma, ver u ocultar las archivadas segun sea necesario. Tambien puede ver el grafico de datos del canal seleccionado.
          </p>          
        </>
        : <p className={styles.description}>
          Usted se encuentra en la pagina de detalles del datalogger seleccionado.<br/><br/>
            Dependiendo de su rol, usted puede tener permisos limitados para ver o administrar ciertas ubicaciones, usuarios y dataloggers.
          </p>
      }
      <Breadcrumb 
        ubicacion={selectedChannel?.business.name}
        datalogger={selectedChannel?.datalogger.name}
        canal={selectedChannel?.name}
      />
      <div className={styles.cardsContainer}>
          <CardImage
            image={`${selectedChannel?.img}`}
            title={selectedChannel?.name}
            buttons={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator' ? channelButtons : ''}
          >
            {selectedChannel?.is_active == '0'
              ? (<CustomTag text="Archivado" type="archive" icon="/icons/archive-solid.svg" />)
              : ''
          }
            <ChannelInfo 
              channel={selectedChannel} 
              alarms={seletedChannelAlarms.filter(alarm => alarm.is_active == '1')} 
              datalogger={selectedChannel?.datalogger}
              totalTime={channelUsage?.totalData.total_time_on_hours}
              firstDate={channelUsage?.totalData.first_date}
              lastDate={channelUsage?.totalData.last_date}
              totalAverageTime={channelUsage?.totalData.average_usage_percentage}
            />
          </CardImage>
      </div>


      <ViewChart 
        title={`Datos del canal '${selectedChannel?.name}'`}
        subtitle={`Cada punto del gráfico integra los valores de las lecturas de los últimos ${selectedChannel?.averaging_period } minutos.`}
        availablePresets={[
          RANGE_KEYS.LAST_HOUR,
          RANGE_KEYS.LAST_12H,
          RANGE_KEYS.LAST_24H,
          RANGE_KEYS.LAST_WEEK,
          RANGE_KEYS.LAST_MONTH,
          RANGE_KEYS.LAST_6_MONTHS,
          RANGE_KEYS.LAST_YEAR
        ]}
        onRangeChange={null} //(range) => fetchCpuData(range.start, range.end)}
      >
        <h2>Grafico</h2>

      </ViewChart>


      <Title2 text="Alarmas Configuradas" type="alarmas"/>

      {selectedChannel?.datalogger &&
        <ChannelAlarms 
        businessUuid={businessUuid}
        alarms={seletedChannelAlarms}
        channelId={channelId}
        channelName={selectedChannel?.name}
        dataloggerId={dataloggerId}
        onAlarmClick={handleAlarmClick}
        showAddButton={userCurrentRole === 'Owner' || userCurrentRole === 'Administrator'}
      />}
      
    </>
    );
   
  
};

export default ViewChannel;
