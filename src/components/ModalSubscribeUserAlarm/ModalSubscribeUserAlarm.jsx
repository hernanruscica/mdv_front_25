import { useState, useEffect } from 'react';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import toast from 'react-hot-toast';
import { useUsersAlarmsStore } from '../../store/usersAlarmsStore';

const ModalSubscribeUserAlarm = ({
  isOpen,
  onRequestClose,
  businessUuid,
  alarmUuid,  
  allUsers,
  subscribedUserIds,
  currentUserRole,
  onSuccess,
  isMyAlarmsView = false,
  targetUserUuid = null,
  availableAlarmsForSubscription = []
}) => {
  const [selectedUserUuid, setSelectedUserUuid] = useState('');
  const [selectedAlarmUuid, setSelectedAlarmUuid] = useState('');
  const [loading, setLoading] = useState(false);

  const { subscribeUserToAlarm } = useUsersAlarmsStore();

  const roleHierarchy = { 'Owner': 3, 'Administrator': 2, 'Technician': 1 };
  const currentUserLevel = roleHierarchy[currentUserRole] || 0;

  const availableUsers = allUsers.filter(u => !subscribedUserIds.includes(u.uuid))
    .filter(u => {
      const userRole = u.businesses_roles?.find(br => br.uuid === businessUuid)?.role || 'Technician';
      return roleHierarchy[userRole] <= currentUserLevel;
    });

  // Obtener alarmas disponibles para "mis alarmas" (ya filtradas en Alarms.jsx)
  const availableAlarms = isMyAlarmsView 
    ? (availableAlarmsForSubscription || [])
    : [];

  useEffect(() => {
    if (isOpen) {
      setSelectedUserUuid('');
      setSelectedAlarmUuid('');
    }
  }, [isOpen]);

  const handleSubscribe = async () => {
    if (isMyAlarmsView) {
      // En vista de "mis alarmas": suscribir al usuario objetivo a la alarma seleccionada
      if (!selectedAlarmUuid) {
        toast.error('Selecciona una alarma');
        return;
      }
      const userToSubscribe = targetUserUuid;
      
      setLoading(true);
      try {
        const response = await subscribeUserToAlarm(businessUuid, selectedAlarmUuid, userToSubscribe);
        if (response?.success) {
          toast.success('Te has suscrito a la alarma correctamente');
          onSuccess?.();
          onRequestClose();
        } else {
          toast.error(response?.message || 'Error al suscribirte a la alarma');
        }
      } catch {
        toast.error('Error al suscribirte a la alarma');
      } finally {
        setLoading(false);
      }
    } else {
      // Caso original: admin suscribe a un usuario a una alarma específica
      if (!selectedUserUuid) {
        toast.error('Selecciona un usuario');
        return;
      }

      setLoading(true);
      try {
        const response = await subscribeUserToAlarm(businessUuid, alarmUuid, selectedUserUuid);
        if (response?.success) {
          toast.success('Usuario suscrito a la alarma correctamente');
          onSuccess?.();
          onRequestClose();
        } else {
          toast.error(response?.message || 'Error al suscribir usuario');
        }
      } catch {
        toast.error('Error al suscribir usuario');
      } finally {
        setLoading(false);
      }
    }
  };

  const mappedCurrentRole = {
    'Owner': 'Propietario',
    'Administrator': 'Administrador',
    'Technician': 'Operario'
  };

  const getUserRole = (user) => {
    const role = user.businesses_roles?.find(br => br.uuid === businessUuid)?.role || 'Technician';
    return mappedCurrentRole[role] || role;
  };

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={isMyAlarmsView ? "Suscribirse a una alarma" : "Suscribir usuario a alarma"}
      buttons={[
        { title: 'Cancelar', onClick: onRequestClose },
        { 
          title: isMyAlarmsView ? 'Suscribirse' : 'Suscribir', 
          onClick: handleSubscribe, 
          disabled: loading || (!selectedUserUuid && !selectedAlarmUuid), 
          isLoading: loading 
        }
      ]}
    >
      {isMyAlarmsView ? (
        // Vista de "mis alarmas": seleccionar alarma
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          borderLeft: '4px solid #28a745'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            Selecciona una alarma para suscribirte. Recibirás notificaciones cuando la alarma se dispare.
          </p>
        </div>
      ) : (
        // Vista original: seleccionar usuario
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '12px', 
          borderRadius: '8px', 
          marginBottom: '20px',
          borderLeft: '4px solid #28a745'
        }}>
          <p style={{ margin: 0, fontSize: '0.9rem', color: '#666' }}>
            Selecciona un usuario para suscribir a esta alarma. Recibirá notificaciones cuando la alarma se dispare.
          </p>
        </div>
      )}

      {isMyAlarmsView ? (
        availableAlarms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>No hay alarmas disponibles para suscribirte.</p>
            <p style={{ fontSize: '0.85rem' }}>
              Ya estás suscrito a todas las alarmas de esta ubicación.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="alarm-select" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              Seleccionar alarma:
            </label>
            <select
              id="alarm-select"
              value={selectedAlarmUuid}
              onChange={(e) => setSelectedAlarmUuid(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1.1rem' }}
            >
              <option value="" disabled>-- Seleccione una alarma --</option>
              {availableAlarms.map((alarm) => (
                <option key={alarm.uuid} value={alarm.uuid}>
                  {alarm.name} - {alarm.condition_show}
                </option>
              ))}
            </select>
          </div>
        )
      ) : (
        availableUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
            <p>No hay usuarios disponibles para suscribir.</p>
            <p style={{ fontSize: '0.85rem' }}>
              Todos los usuarios ya están suscritos o no tienes permisos para suscribir a los usuarios disponibles.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label htmlFor="user-select" style={{ fontWeight: '600', fontSize: '1.1rem' }}>
              Seleccionar usuario:
            </label>
            <select
              id="user-select"
              value={selectedUserUuid}
              onChange={(e) => setSelectedUserUuid(e.target.value)}
              style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ddd', fontSize: '1.1rem' }}
            >
              <option value="" disabled>-- Seleccione un usuario --</option>
              {availableUsers.map((user) => (
                <option key={user.uuid} value={user.uuid}>
                  {user.first_name} {user.last_name} ({getUserRole(user)})
                </option>
              ))}
            </select>
          </div>
        )
      )}
    </ModalTemplate>
  );
};

export default ModalSubscribeUserAlarm;
