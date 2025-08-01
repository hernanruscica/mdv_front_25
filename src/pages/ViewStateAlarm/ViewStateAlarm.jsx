import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    const processAlarmState = async () => {
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          setAlarmData(decodedToken);
          
          const dataToUpdate = {
            fecha_vista: new Date().toISOString().replace('T', ' ').substring(0, 19), // YYYY-MM-DD HH:mm:ss
            usuario_id: decodedToken.userId,
          };
//console.log('Data to update:', dataToUpdate);
//console.log('Decoded token:', decodedToken);
          const response = await alarmLogsService.update(decodedToken.alarmLogId, dataToUpdate);
          
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
      navigate(`/panel/dataloggers/${alarmData.dataloggerId}/canales/${alarmData.channelId}/alarmas/${alarmData.alarmId}`);
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
        <p>Se registró que su usuario <strong>{`${user.nombre_1} ${user.apellido_1}`}</strong> vió la alarma!</p>
      </ModalTemplate>

      {/* <h1>Estado de la Alarma</h1>
      <p>Detalles de la alarma:</p>
      <pre>{JSON.stringify(alarmData, null, 2)}</pre> */}
    </div>
  );
};

export default ViewStateAlarm;
