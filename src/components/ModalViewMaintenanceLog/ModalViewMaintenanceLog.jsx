import { useState, useEffect, useMemo } from 'react';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import { useMaintenanceLogsStore } from '../../store/maintenanceLogsStore';
import toast from 'react-hot-toast';
import SelectWithColor from '../SelectWithColor/SelectWithColor';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/maintenanceLogOptions';
import styles from './ModalViewMaintenanceLog.module.css';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ModalViewMaintenanceLog = ({
  isOpen,
  onRequestClose,
  log,
  businessUuid,
  dataloggerUuid,
  channelUuid,
  onUpdateSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');

  const {
    updateMaintenanceLog,
    loadingStates: { updateMaintenanceLog: isUpdating }
  } = useMaintenanceLogsStore();

  useEffect(() => {
    if (isOpen && log) {
      setTitle(log.title || '');
      setDescription(log.description || '');
      setStatus(log.status || 'pending');
      setPriority(log.priority || 'medium');
    }
  }, [isOpen, log]);

  const hasChanges = useMemo(() => {
    if (!log) return false;
    return (
      title !== (log.title || '') ||
      description !== (log.description || '') ||
      (log.type === 'task' && status !== (log.status || 'pending')) ||
      (log.type === 'observation' && priority !== (log.priority || 'medium'))
    );
  }, [log, title, description, status, priority]);

  const handleSave = async () => {
    try {
      const updateData = {
        title,
        description,
        ...(log?.type === 'task' ? { status } : { priority })
      };

      const response = await updateMaintenanceLog(
        businessUuid,
        dataloggerUuid,
        log?.uuid,
        updateData,
        channelUuid
      );

      if (response?.success) {
        toast.success('Cambios guardados exitosamente');
        onUpdateSuccess?.();
        onRequestClose();
      } else {
        toast.error(response?.message || 'Error al guardar los cambios');
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      toast.error('Error al guardar los cambios');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    onRequestClose();
  };

  const isTask = log?.type === 'task';
  const isObservation = log?.type === 'observation';

  const buttons = hasChanges
    ? [
        { title: 'Cancelar', onClick: handleClose },
        {
          title: isUpdating ? 'Guardando...' : 'Guardar cambios',
          onClick: handleSave,
          disabled: isUpdating
        }
      ]
    : [
        { title: 'Cerrar', onClick: handleClose }
      ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={handleClose}
      title={isTask ? 'Ver Tarea' : 'Ver Observación'}
      buttons={buttons}
    >
      <div className={styles.formContainer}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Título</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            rows={4}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Fecha de Creación</label>
          <input
            type="text"
            value={formatDate(log?.created_at)}
            readOnly
            className={styles.inputReadOnly}
          />
        </div>

{isTask && (
          <>
            <SelectWithColor
              label="Estado"
              options={STATUS_OPTIONS}
              value={status}
              onChange={setStatus}
            />
          </>
        )}

        {isObservation && (
          <SelectWithColor
            label="Prioridad"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />
        )}
      </div>
    </ModalTemplate>
  );
};

export default ModalViewMaintenanceLog;
