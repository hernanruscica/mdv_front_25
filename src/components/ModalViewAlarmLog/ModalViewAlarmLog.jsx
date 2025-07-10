import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSolutionsStore } from '../../store/solutionsStore';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import styles from './ModalViewAlarmLog.module.css';

const ModalViewAlarmLog = ({ isOpen, onRequestClose, evento }) => {
  const [solutionText, setSolutionText] = useState('');
  const { user } = useAuthStore();
  const { 
    solutions,
    fetchSolutionsByAlarmLogId,
    createSolution,
    loadingStates: { fetchSolutions, createSolution: isCreatingSolution },
    error 
  } = useSolutionsStore();

  useEffect(() => {
    // Limpiar el texto de la solución cuando se cierra el modal
    if (!isOpen) {
      setSolutionText('');
    }
  }, [isOpen]);

  useEffect(() => {
    let isMounted = true;

    const loadSolutions = async () => {
      if (isOpen && evento?.id && evento?.evento !== 'Reset') {
        try {
          await fetchSolutionsByAlarmLogId(evento.id);
        } catch (error) {
          if (isMounted) {
            console.error('Error al cargar soluciones:', error);
          }
        }
      }
    };

    loadSolutions();

    return () => {
      isMounted = false;
    };
  }, [isOpen, evento?.id, evento?.evento]);

  const handleSubmitSolution = async () => {
    if (!solutionText.trim()) return;

    const now = new Date();
    const formattedDateTime = now.toLocaleString('es-AR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });

    try {
      await createSolution({
        nombre: `Solución para evento ${evento.evento} - ${formattedDateTime}`,
        descripcion: solutionText,
        alarmas_logs_id: evento.id,
        usuarios_id: user.id        
      });
      setSolutionText('');
      onRequestClose();
    } catch (error) {
      console.error('Error al crear la solución:', error);
    }
  };

  if (fetchSolutions) {
    return (
      <>Cargando soluciones...</>
    )
  }

  //console.log(solutions);

  return (
    <ModalTemplate
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`Detalle del evento`}
      buttons={[
        ...(evento?.evento !== 'Reset' ? [
          { 
            title: 'Guardar Solución', 
            onClick: handleSubmitSolution,
            disabled: !solutionText.trim() || isCreatingSolution,
            type: 'primary'
          }
        ] : []),
        { title: 'Cerrar', onClick: onRequestClose }
      ]}
    >      
        <p><strong>Fecha:</strong> {evento?.fecha}</p>        
        <p><strong>Mensaje:</strong> {evento?.mensaje}</p>
        <p><strong>Evento:</strong> {evento?.evento}</p>
        <p><strong>Usuarios notificados:</strong></p>
        <ul className={styles.usersList}>
          {evento?.usuarios_afectados.map((u, i) => (
            <li key={i}>
              {u.nombre} {u.apellido} — {u.email} - {u.vista ? 'Vista' : 'No Vista'}
            </li>
          ))}
        </ul>

        {evento?.evento !== 'Reset' && (
          <>
            {solutions.length > 0 && (
              <div className={styles.solutionsContainer}>
                <p><strong>Soluciones anteriores:</strong></p>
                <ul className={styles.solutionsList}>
                  {solutions.map((solution) => (
                    <li key={solution.id}>
                      <p className={styles.solutionText}>{solution.descripcion}</p>
                      <p className={styles.solutionMeta}>
                        Por: {solution.nombre_1} {solution.apellido_1} - 
                        {new Date(solution.fecha_creacion).toLocaleString('es-AR', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className={styles.newSolutionContainer}>
              <p><strong>Agregar nueva solución:</strong></p>
              <textarea 
                value={solutionText}
                onChange={(e) => setSolutionText(e.target.value)}
                placeholder="Describe la solución implementada..."
                className={styles.solutionTextarea}
                rows={4}
              />
            </div>
          </>
        )}
    </ModalTemplate>
  );
};

export default ModalViewAlarmLog;