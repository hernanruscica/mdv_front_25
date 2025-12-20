import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSolutionsStore } from '../../store/solutionsStore';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import styles from './ModalViewAlarmLog.module.css';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'; 
import toast from 'react-hot-toast';

const ModalViewAlarmLog = ({ isOpen, onRequestClose, evento, businessUuid }) => {
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
    if (!isOpen) {
      setSolutionText('');
    }
  }, [isOpen]);

 useEffect(() => {
    let isMounted = true;
    const loadSolutions = async () => {    
      if (isOpen && evento?.id && evento?.evento !== 'Reset') {
        try {
          await fetchSolutionsByAlarmLogId(businessUuid, evento.id);
        } catch (error) {
          if (isMounted) console.error('Error:', error);
        }
      }
    };
    loadSolutions();
    return () => { isMounted = false; };
  }, [isOpen, evento?.id, evento?.evento, businessUuid, fetchSolutionsByAlarmLogId, isCreatingSolution]);

  const handleSubmitSolution = async () => {
    if (!solutionText.trim()) return;
    const now = new Date();
    
    const formattedDateTime = now.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }); // Simplificado

    try {
      await createSolution(businessUuid, {
        name: `Solución para evento ${evento.evento} - ${formattedDateTime}`,
        description: solutionText,
        alarms_logs_id: evento.id,
        user_id: user?.uuid,
        business_uuid: businessUuid        
      });
      setSolutionText('');
      toast.success('Solución creada con éxito');
      //onRequestClose();
    } catch (error) {
      console.error('Error al crear la solución:', error);
    }
  };

  console.log('user en modalViewAlarmLog', user);
  

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
        
        {fetchSolutions ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>            
             <LoadingSpinner />
          </div>
        ) : (
          <>
            <p><strong>Fecha:</strong> {evento?.fecha}</p>        
            <p><strong>Mensaje:</strong> {evento?.mensaje}</p>
            <p><strong>Evento:</strong> {evento?.evento}</p>
            <p><strong>Usuarios notificados:</strong></p>
            <ul className={styles.usersList}>
              {evento?.usuarios_afectados?.map((u, i) => (
                <li key={i}>
                  {u.nombre} {u.apellido} — {u.email} - {u.vista ? 'Vista' : 'No Vista'}
                </li>
              ))}
            </ul>


            {evento?.evento !== 'Reset' && (
              <>
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
                {solutions?.length > 0 && (
                  <div className={styles.solutionsContainer}>
                    <p><strong>Soluciones anteriores:</strong></p>
                    <ul className={styles.solutionsList}>
                      {solutions?.map((solution) => (
                        <li key={solution?.uuid || solution?.id}>
                          <p className={styles.solutionText}>{solution?.description}</p>
                          <p className={styles.solutionMeta}>                            
                            Por: {solution.user?.first_name} {solution.user?.last_name} - 
                            {new Date(solution?.created_at).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                
              </>
            )}
          </>
        )}
    </ModalTemplate>
  );
};

export default ModalViewAlarmLog;