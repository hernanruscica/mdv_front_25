import React, {useState, useEffect} from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb.jsx";
import { Title1 } from "../../components/Title1/Title1.jsx";
import { useChannelsStore } from '../../store/channelsStore.js';
import { useDataloggersStore } from '../../store/dataloggersStore.js';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner.jsx';

import {UserCreateForm} from '../../components/Forms/UserCreateForm.jsx';
import { DefaultForm } from '../../components/Forms/DefaultForm.jsx';

const nameEntity = (path) => {
  const lastEntityName = (path.length > 1 ) ? path[path.length - 2] : 'default'
  return lastEntityName;
}

 const formComponents = {
    usuarios: UserCreateForm,      
    default: DefaultForm,
  };
  

const CreatePage = () => {
  const { userId, locationId, dataloggerId, channelId } = useParams();
  const location = useLocation();  
  const fullPath = location.pathname.split('/').filter(path => path !== '');   
  const [currentEntityName, setCurrentEntityName] = useState(nameEntity(fullPath));
  const [currentChannel, setCurrentChannel] = useState();
  const [currentDatalogger, setCurrentDatalogger] = useState();

  const { 
    fetchChannelById, 
    selectedChannel,
    loadingStates: { fetchChannel: loadingChannel }
  } = useChannelsStore();

  const {
    fetchDataloggerById,
    selectedDatalogger,
    loadingStates: { fetchDatalogger: loadingDatalogger }
  } = useDataloggersStore();

  useEffect(() => {
    if (channelId) {
      fetchChannelById(channelId);
    }
  }, [channelId]);

  useEffect(() => {
    if (dataloggerId) {
      fetchDataloggerById(dataloggerId);
    }
  }, [dataloggerId]);

  useEffect(() => {
    if (selectedChannel) {
      setCurrentChannel(selectedChannel);
    }
  }, [selectedChannel]);

  useEffect(() => {
    if (selectedDatalogger) {
      setCurrentDatalogger(selectedDatalogger);
    }
  }, [selectedDatalogger]);

  if (loadingChannel || loadingDatalogger) {
    return <LoadingSpinner message='Cargando datos...' />
  }

  const FormComponent = formComponents[currentEntityName] || formComponents.default;

  console.log("datalogger", currentDatalogger);
  console.log("channel", currentChannel)

  return (
    <>
      <Title1
        type="edicion"
        text={`Página de creación de ${currentEntityName}`}
      />
      <Breadcrumb 
        usuario=''
        datalogger={currentDatalogger?.nombre || ''}
        canal={currentChannel?.nombre || ''}
        alarma=''
      />

      <FormComponent />

    </>
  );
};

export default CreatePage;