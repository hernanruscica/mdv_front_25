import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import toast from 'react-hot-toast';
import { alarmLogsService } from '../../services/alarmLogsService';
import ModalTemplate from '../../components/ModalTemplate/ModalTemplate';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';
import { useAuthStore } from '../../store/authStore';

const TOKEN_PARTS = 3;

const getErrorMessage = (errorType) => {
  const messages = {
    no_token: 'No se encontró el token de verificación en la URL.',
    token_invalid: 'El enlace de verificación no es válido. Solicite un nuevo enlace.',
    token_expired: 'El enlace de verificación ha expirado. Solicite un nuevo enlace.',
    token_decode_error: 'No se pudo leer el enlace de verificación. Solicite un nuevo enlace.',
    alarm_not_found: 'El registro de alarma no existe o ya fue eliminado.',
    alarm_already_seen: 'Esta alarma ya fue confirmada anteriormente.',
    api_error: 'Ocurrió un error al actualizar el estado de la alarma. Intente nuevamente.',
    network_error: 'Error de conexión con el servidor. Verifique su conexión a internet.',
  };
  return messages[errorType] || 'Ha ocurrido un error inesperado.';
};

const ViewStateAlarm = () => {
  const { token: tokenParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [alarmData, setAlarmData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorType, setErrorType] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const processAlarmState = useCallback(async () => {
    setIsLoading(true);
    setErrorType(null);

    if (!tokenParam) {
      setErrorType('no_token');
      setIsLoading(false);
      return;
    }

    const parts = tokenParam.split('.');
    if (parts.length !== TOKEN_PARTS) {
      setErrorType('token_invalid');
      setIsLoading(false);
      return;
    }

    let decodedToken;
    try {
      decodedToken = jwtDecode(tokenParam);
    } catch {
      setErrorType('token_decode_error');
      setIsLoading(false);
      return;
    }

    if (decodedToken.exp && Date.now() >= decodedToken.exp * 1000) {
      setErrorType('token_expired');
      setIsLoading(false);
      return;
    }

    setAlarmData(decodedToken);

    try {
      const dataToUpdate = {
        seen_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
        updated_by: decodedToken.userId,
      };
      const response = await alarmLogsService.update(decodedToken.businessUuid, decodedToken.logId, dataToUpdate);

      if (response?.success) {
        setIsModalOpen(true);
        toast.success('Alarma confirmada correctamente');
      } else {
        setErrorType('api_error');
      }
    } catch (e) {
      if (e.response) {
        const status = e.response.status;
        if (status === 404) {
          setErrorType('alarm_not_found');
        } else if (status === 409 || status === 400) {
          setErrorType('alarm_already_seen');
        } else {
          setErrorType('api_error');
        }
      } else {
        setErrorType('network_error');
      }
    } finally {
      setIsLoading(false);
    }
  }, [tokenParam]);

  useEffect(() => {
    processAlarmState();
  }, [processAlarmState]);

  const handleCloseModalAndRedirect = () => {
    setIsModalOpen(false);
    if (alarmData) {
      if (alarmData?.alarm_type && alarmData?.alarm_type === 'comunication_failure') {
        navigate(`/panel/ubicaciones/${alarmData.businessUuid}/dataloggers/${alarmData.dataloggerId}/alarmas/${alarmData.alarmId}`);
      } else {
        navigate(`/panel/ubicaciones/${alarmData.businessUuid}/dataloggers/${alarmData.dataloggerId}/canales/${alarmData.channelId}/alarmas/${alarmData.alarmId}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <LoadingSpinner message="Verificando enlace de confirmación..." />
      </div>
    );
  }

  if (errorType) {
    const showRetry = errorType === 'api_error' || errorType === 'network_error';
    return (
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', padding: '20px'
      }}>
        <div style={{
          maxWidth: '480px', textAlign: 'center', padding: '40px',
          borderRadius: '12px', boxShadow: '0 2px 12px rgba(0,0,0,0.1)'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#9888;&#65039;</div>
          <h1 style={{ fontSize: '22px', marginBottom: '12px', color: '#333' }}>Error de Verificación</h1>
          <p style={{ fontSize: '15px', color: '#666', marginBottom: '24px', lineHeight: 1.5 }}>
            {getErrorMessage(errorType)}
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {showRetry && (
              <button
                onClick={processAlarmState}
                style={{
                  padding: '10px 24px', borderRadius: '8px', border: 'none',
                  background: '#0052cc', color: '#fff', fontSize: '14px',
                  cursor: 'pointer', fontWeight: 600
                }}
              >
                Reintentar
              </button>
            )}
            <button
              onClick={() => navigate('/panel')}
              style={{
                padding: '10px 24px', borderRadius: '8px', border: '1px solid #ccc',
                background: '#fff', color: '#333', fontSize: '14px',
                cursor: 'pointer', fontWeight: 600
              }}
            >
              Volver al Panel
            </button>
          </div>
        </div>
      </div>
    );
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
        <p>Se registró que su usuario <strong>{`${user?.first_name || ''} ${user?.last_name || ''}`}</strong> vio el correo de alarma.</p>
        <p>Click en [ACEPTAR] para ver el detalle.</p>
      </ModalTemplate>
    </div>
  );
};

export default ViewStateAlarm;
