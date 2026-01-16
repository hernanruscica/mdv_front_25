import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import { alarmLogsService } from '../../services/alarmLogsService';
import ModalTemplate from '../../components/ModalTemplate/ModalTemplate';
import { useAuthStore } from '../../store/authStore';

const ViewStateAlarm = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [alarmData, setAlarmData] = useState(null);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuthStore();

  /* payload and atributes generated on the backend when creating the token, uuid format char(36):
    const payload = {
    logId, 
    userId,
    alarmId,
    channelId,
    dataloggerId,
    businessUuid,    
    type: 'ALARM_ACKNOWLEDGE' 
  };

  */
  useEffect(() => {
    const processAlarmState = async () => {
      
      if (token) {
       // console.log('tengo token en viewStateAlarm');
        try {          
          const decodedToken = jwtDecode(token);
          setAlarmData(decodedToken);
          
          const dataToUpdate = {
            seen_at: new Date().toISOString().replace('T', ' ').substring(0, 19), // YYYY-MM-DD HH:mm:ss
            updated_by: decodedToken.userId,
          };
          const response = await alarmLogsService.update(decodedToken.businessUuid, decodedToken.logId, dataToUpdate);
          
          if (response.success) {
            setIsModalOpen(true);
          }

        } catch (e) {
          setError('Ha ocurrido un error. No se pudo actualizar el estado de la alarma.');
          console.error(e);
        }
      }
    };

    processAlarmState();
  }, [token]);

  const handleCloseModalAndRedirect = () => {
    setIsModalOpen(false);
    if (alarmData) {
      navigate(`/panel/ubicaciones/${alarmData.businessUuid}/dataloggers/${alarmData.dataloggerId}/canales/${alarmData.channelId}/alarmas/${alarmData.alarmId}`);
    }
  };

  if (error) {
    return <div><h1>Error</h1><p>{error}</p></div>;
  }

  if (!alarmData) {
    return <div><h1>Cargando...</h1></div>;
  } 
  

  return (
    <div>
      <ModalTemplate
        isOpen={isModalOpen}
        onRequestClose={handleCloseModalAndRedirect}
        title="Alarma Vista"
        buttons={[
          {
            title: 'Aceptar',
            onClick: handleCloseModalAndRedirect,
            type: 'normal'
          }
        ]}
      >
        <p>El estado del historial de la alarma se actualizó correctamente.</p><br />
        <p>Se registró que su usuario <strong>{`${user.first_name} ${user.last_name}`}</strong> vió el correo de alarma!</p>
        <p>Click en [ACEPTAR] para ver el detalle.</p>
      </ModalTemplate>
   
    </div>
    
  );
  
};

export default ViewStateAlarm;
