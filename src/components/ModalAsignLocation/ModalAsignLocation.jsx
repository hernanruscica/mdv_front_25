import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import toast from 'react-hot-toast';

const ModalAsignLocation = ({
  isOpen,
  onRequestClose,
  isEditing,
  user,               // El objeto selectedUser que mostraste
  availableLocations,       
  currentLocation, 
  availableRoles,     // Nueva prop: array de roles
  currentRole,        // Nueva prop: rol actual del usuario
  redirectTo,
  businessUuid
}) => {
  const navigate = useNavigate();
  
  // Estados para ambos selectores
  const [locationUuid, setLocationUuid] = useState('');
  const [roleUuid, setRoleUuid] = useState('');

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

    console.log('Datos a enviar:', {
      userUuid: user?.uuid,
      locationUuid,
      roleUuid
    });
    
    // Aquí tu lógica de updateFn...
  };

  console.log('currentRole', currentRole);
  //console.log('roleUuid', roleUuid);
  

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={isEditing ? `Gestionar Permisos` : 'Asignar Ubicación y Rol'}
      buttons={[
        { title: 'Cancelar', onClick: onRequestClose },
        { title: 'Aceptar', onClick: handleAccept }
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
        
        {/* Selector de Ubicación */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="location-select" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
            Ubicación:
          </label>
          <select
            id="location-select"
            value={locationUuid} 
            onChange={(e) => setLocationUuid(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="" disabled>-- Seleccione una ubicación --</option>
            {availableLocations?.map((loc) => (
              <option key={loc.uuid} value={loc.uuid}>{loc.name}</option>
            ))}
          </select>
        </div>

        {/* Selector de Rol */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <label htmlFor="role-select" style={{ fontWeight: '600', fontSize: '0.9rem' }}>
            Rol en esta ubicación:
          </label>
          <select
            id="role-select"
            value={roleUuid} 
            onChange={(e) => setRoleUuid(e.target.value)}
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd' }}
          >
            <option value="" disabled>-- Seleccione un rol --</option>
            {availableRoles?.map((role) => (
              <option key={role.uuid} value={role.uuid}>{mappedCurrentRole[role.name]}</option>
            ))}
          </select>
        </div>

      </div>
    </ModalTemplate>
  );
};

export default ModalAsignLocation;