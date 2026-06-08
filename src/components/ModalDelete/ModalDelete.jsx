
import { useNavigate } from 'react-router-dom';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import styles from '../ModalTemplate/ModalTemplate.module.css';
import { useUsersStore } from '../../store/usersStore';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import toast from 'react-hot-toast';

const ENTITY_MAP = {
  usuario:   { store: useUsersStore,    delete: 'deleteUser' },
  ubicacion: { store: useLocationsStore, delete: null },
  datalogger: { store: useDataloggersStore, delete: null },
  canal:     { store: useChannelsStore, delete: null },
  alarma:    { store: useAlarmsStore,   delete: null },
};

const ModalDelete = ({
  isOpen,
  onRequestClose,
  entidad,      // string: 'usuario', 'ubicacion', etc.
  entidadId,    // id numérico  
  redirectTo,   // ruta para redireccionar luego de la acción
  nombre,       // nombre visible de la entidad (opcional, para mostrar en el mensaje)
  businessUuid
}) => {
  const navigate = useNavigate();

  // Obtener el store y la función de update correspondiente
  const entityConfig = ENTITY_MAP[entidad];
  const store = entityConfig?.store();
  const deleteFn = store?.[entityConfig.delete];

  const handleAccept = async () => {
    if (deleteFn && entidadId) {
      //console.log('Updating entity:', entidad, 'ID:', entidadId, 'to new state:', nuevoEstado);
      const responseStore = await deleteFn(businessUuid, entidadId);
      onRequestClose();
      if (responseStore){
        toast.success(`${entidad.charAt(0).toUpperCase() + entidad.slice(1)} eliminado exitosamente.`);
      }else{
        toast.error(`Error eliminando al ${entidad.charAt(0).toUpperCase() + entidad.slice(1)}`);
      }
      navigate(redirectTo);
    }
  };
/*
  console.log('entidad:', entidad);
  console.log('redirectto', redirectTo);
  console.log('entidadId', entidadId);
  
  console.log('updateFn', updateFn);
  
  */

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={'Confirmar eliminación'}
      buttons={[
        { title: 'Cancelar', onClick: onRequestClose },
        { title: 'Aceptar', onClick: handleAccept }
      ]}
    >
      <p>
        {`
        ¿Estás seguro que deseas eliminar definitivamente 
        ${(entidad == 'ubicacion' || entidad == 'alarma') ? ' la ' : ' el '}
        `}
        <strong> {entidad} </strong><br/>
        <strong><em>{nombre}</em> </strong><br/>
        <span className={styles.textDanger}>ATENCION: ESTE PROCESO NO SE PUEDE REVERTIR!</span>
      </p>
    </ModalTemplate>
  );
};

export default ModalDelete;