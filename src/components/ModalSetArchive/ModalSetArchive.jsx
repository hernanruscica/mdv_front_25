import React from 'react';
import { useNavigate } from 'react-router-dom';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import { useUsersStore } from '../../store/usersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';

const ENTITY_MAP = {
  usuario:   { store: useUsersStore,    update: 'updateUser' },
  ubicacion: { store: useLocationsStore, update: 'updateLocation' },
  datalogger: { store: useDataloggersStore, update: 'updateDatalogger' },
  canal:     { store: useChannelsStore, update: 'updateChannel' },
  alarma:    { store: useAlarmsStore,   update: 'updateAlarm' },
};

const ModalSetArchive = ({
  isOpen,
  onRequestClose,
  entidad,      // string: 'usuario', 'ubicacion', etc.
  entidadId,    // id numérico
  nuevoEstado,  // 0 o 1
  redirectTo,   // ruta para redireccionar luego de la acción
  nombre,       // nombre visible de la entidad (opcional, para mostrar en el mensaje)
  businessUuid
}) => {
  const navigate = useNavigate();

  // Obtener el store y la función de update correspondiente
  const entityConfig = ENTITY_MAP[entidad];
  const store = entityConfig?.store();
  const updateFn = store?.[entityConfig.update];

  const handleAccept = async () => {
    if (updateFn && entidadId) {
      const responseStore = await updateFn(entidadId, { is_active: nuevoEstado, businessUuid: businessUuid });
      console.log('Response from update:', responseStore);
      onRequestClose();
      navigate(redirectTo);
    }
  };

  console.log('entidad:', entidad);
  console.log('redirectto', redirectTo);
  console.log('entidadId', entidadId);
  
  console.log('updateFn', updateFn);
  
  

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`Confirmar ${nuevoEstado == false ? 'archivar' : 'desarchivar'}`}
      buttons={[
        { title: 'Cancelar', onClick: onRequestClose },
        { title: 'Aceptar', onClick: handleAccept }
      ]}
    >
      <p>
        {`
        ¿Estás seguro que deseas ${nuevoEstado === false  ? 'archivar' : 'desarchivar'} 
        ${(entidad == 'ubicacion' || entidad == 'alarma') ? ' la ' : ' el '}
        `}
        <strong> {entidad} </strong><br/>
        <strong><em>{nombre}</em> </strong>
      </p>
    </ModalTemplate>
  );
};

export default ModalSetArchive;