import { useState, useEffect } from 'react';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import { useMaintenanceLogsStore } from '../../store/maintenanceLogsStore';
import toast from 'react-hot-toast';
import SelectWithColor from '../SelectWithColor/SelectWithColor';
import { PRIORITY_OPTIONS, STATUS_OPTIONS } from '../../utils/maintenanceLogOptions';
import styles from './ModalCreateMaintenanceLog.module.css';

const ModalCreateMaintenanceLog = ({
  isOpen,
  onRequestClose,
  logType,
  businessUuid,
  dataloggerUuid,
  channelUuid,
  onCreateSuccess
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [priority, setPriority] = useState('medium');

  const {
    createMaintenanceLog,
    loadingStates: { createMaintenanceLog: isCreating }
  } = useMaintenanceLogsStore();

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setPriority('medium');
    }
  }, [isOpen]);

  const handleCreate = async () => {
    if (!title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    try {
      const logData = {
        title: title.trim(),
        description: description.trim(),
        type: logType,
        status: logType === 'task' ? status : undefined,
        priority: priority
      };

      const response = await createMaintenanceLog(
        businessUuid,
        dataloggerUuid,
        logData,
        channelUuid
      );

      if (response?.success) {
        toast.success(`${logType === 'task' ? 'Tarea' : 'Observación'} creada exitosamente`);
        onCreateSuccess?.();
        onRequestClose();
      } else {
        toast.error(response?.message || 'Error al crear');
      }
    } catch (error) {
      console.error('Error al crear:', error);
      toast.error('Error al crear');
    }
  };

  const handleClose = () => {
    setTitle('');
    setDescription('');
    setStatus('pending');
    setPriority('medium');
    onRequestClose();
  };

  const isTask = logType === 'task';
  const isObservation = logType === 'observation';

  const buttons = [
    { title: 'Cancelar', onClick: handleClose },
    {
      title: isCreating ? 'Creando...' : 'Crear',
      onClick: handleCreate,
      disabled: isCreating || !title.trim()
    }
  ];

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={handleClose}
      title={isTask ? 'Nueva Tarea' : 'Nueva Observación'}
      buttons={buttons}
    >
      <div className={styles.formContainer}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={styles.input}
            placeholder="Ingrese el título"
          />
        </div>

        <div className={styles.fieldGroup}>
          <label className={styles.label}>Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={styles.textarea}
            placeholder="Ingrese la descripción (opcional)"
            rows={3}
          />
        </div>

        {(isObservation) &&
          <SelectWithColor
            label="Prioridad"
            options={PRIORITY_OPTIONS}
            value={priority}
            onChange={setPriority}
          />}

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
      </div>
    </ModalTemplate>
  );
};

export default ModalCreateMaintenanceLog;
