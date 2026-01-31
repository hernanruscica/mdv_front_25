import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import ModalConfirmation from '../ModalConfirmation/ModalConfirmation';
import toast from 'react-hot-toast';
import BtnCallToAction from '../BtnCallToAction/BtnCallToAction';
import { useLocationUsersStore } from '../../store/locationUsersStore';

const ModalAsignLocation = ({
  isOpen,
  onRequestClose,
  isEditing,
  user,               
  availableLocations,       
  currentLocation, 
  availableRoles,     
  currentRole,        
  redirectTo,
  businessUuid
}) => {
  const navigate = useNavigate();
  
  // Estados para ambos selectores
  const [locationUuid, setLocationUuid] = useState('');
  const [roleUuid, setRoleUuid] = useState('');
  const [modalConfirmationOpen, setModalConfirmationOpen] = useState(false);

  const { createLocationUser,
          updateLocationUser,
          deleteLocationUser,
          loadingStates: {
              createLocationUser: isCreatingLocationUserm,
              updateLocationUser: isUpdatingLocationUser,
              deleteLocationUser: isDeletingLocationUser,
          error: errorCreatingLocationUser
          }
  } = useLocationUsersStore();

  const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Administrator': 'Administrador',
    'Technician': 'Operario'
    }

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        // Setear Ubicación inicial
        const locId = currentLocation?.uuid || currentLocation || '';
        setLocationUuid(locId);
        
        // Setear Rol inicial
        const roleId = availableRoles.find(ar => ar.name == currentRole)?.uuid;
        setRoleUuid(roleId);
      } else {
        // Limpiar ambos si es nuevo
        setLocationUuid('');
        setRoleUuid('');
      }
    }
  }, [isOpen, isEditing, currentLocation, currentRole]);

  const handleAccept = async () => {
    if (!locationUuid) return toast.error("Selecciona una ubicación");
    if (!roleUuid) return toast.error("Selecciona un rol");

    const dataToSend = {
        businessUserUuid: isEditing ? currentLocation?.business_user_uuid : null,
        userUuid: user?.uuid,
        locationUuid,
        roleUuid
      };
    console.log(`Datos a ${isEditing ? 'Editar' : 'Crear'} : `, dataToSend);       
    
    if (!isEditing){
      try {
       const response = await createLocationUser(dataToSend);
        //console.log('response on modalAsign', response);
        if (response?.success){          
          toast.success('Usuario agregado a la ubicacion con exito!');
        }else{
          toast.error('Error al agregar al usuario a la ubicacion...');
        }
        
      } catch (error) {
       console.log(error); 
      } finally {
        onRequestClose();
      }
    }else{
      try {
        const response = await updateLocationUser(dataToSend);
        console.log('response on modalAsign', response);
        if (response?.success){          
          toast.success('Rol del usuario en la ubicacion, editado con exito!');
        }else{
          toast.error('Error al editar el rol del usuario en la ubicacion...');
        }        
      } catch (error) {
        console.log(error); 
      } finally {
        onRequestClose();
      }
    }

  };

  const deleteBusinessUser = async  (data) => {
    console.log('delete businessUser relationship', currentLocation?.business_user_uuid);    
    const businessUserUuid = currentLocation?.business_user_uuid || null;
    try {
      const response = await deleteLocationUser(businessUuid, businessUserUuid);
       if (response?.success){          
          toast.success('Permisos del usuario en la ubicacion eliminados definitivamente!');
        }else{
          toast.error('Error al eliminar definitivamente al usuario a la ubicacion...');
        }
    } catch (error) {
        console.error(error);
    } finally {
      setModalConfirmationOpen(false);
      onRequestClose();
    }
  }

  //console.log('currentRole', currentRole);
  //console.log('roleUuid', roleUuid);
  //console.log('availableLocations', availableLocations);
  
  

  return (
    <>
    
    <ModalConfirmation 
      isOpen={modalConfirmationOpen}
      onRequestClose={() => setModalConfirmationOpen(false)}
      handleAccept={deleteBusinessUser}
      mesagge={`Realmente quiere sacarle los permisos de [${mappedCurrentRole[currentRole]}] en "${currentLocation.name}" a "${user.first_name} ${user.last_name}" ?`}
    />
     
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={isEditing ? `Gestionar Permisos` : 'Asignar Ubicación y Rol'}
      buttons={[
        { title: 'Cancelar', onClick: onRequestClose },
        { title: 'Guardar cambios', onClick: handleAccept }
      ]}
    >
      {/* Sección de Contexto del Usuario */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '12px', 
        borderRadius: '8px', 
        marginBottom: '20px',
        borderLeft: '4px solid #007bff'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', color: '#333' }}>
          Usuario: <span style={{ fontWeight: '400' }}>{user?.first_name} {user?.last_name}</span>
        </p>
        <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
          Email: {user?.email}
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {(availableLocations && availableLocations?.length > 0)        
        ?(<>
          {/* Selector de Ubicación */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="location-select" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              Ubicación:
            </label>
            <select
              id="location-select"
              value={locationUuid} 
              disabled={isEditing}
              onChange={(e) => setLocationUuid(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd',  fontSize: '1.1rem' }}
            >
              <option value="" disabled>-- Seleccione una ubicación --</option>
              {availableLocations?.map((loc) => (
                <option key={loc.uuid} value={loc.uuid}>{loc.name}</option>
              ))}
            </select>
          </div>

          {/* Selector de Rol */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="role-select" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              Rol en esta ubicación:
            </label>
            <select
              id="role-select"
              value={roleUuid}             
              onChange={(e) => setRoleUuid(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd',  fontSize: '1.1rem' }}
            >
              <option value="" disabled>-- Seleccione un rol --</option>
              {availableRoles?.map((role) => (
                <option key={role.uuid} value={role.uuid}>{mappedCurrentRole[role.name]}</option>
              ))}
            </select>
          </div>
        </>)
        : <p>El usuario ya tiene un rol en cada ubicacion existente</p>
        }
        {isEditing &&
        <div style={{ display: 'flex', flexDirection: 'column', alignItems:"center", gap: '8px' }}>
          <BtnCallToAction
            text="Eliminar permisos del usuario en la ubicacion"
            icon="trash-alt-regular.svg"
            type="danger"
            onClick={() => setModalConfirmationOpen(true)}
          />
        </div>}

      </div>
    </ModalTemplate>
    </>
  );
};

export default ModalAsignLocation;