import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSolutionsStore } from '../../store/solutionsStore';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import styles from './ModalViewAlarmLog.module.css';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'; 
import toast from 'react-hot-toast';

const ModalViewAlarmLog = ({ isOpen, onRequestClose, evento, businessUuid, solutions = [] }) => {
  const [solutionText, setSolutionText] = useState('');
  const [localSolutions, setLocalSolutions] = useState([]);
  
  const { user } = useAuthStore();
  const {         
    createSolution,
    loadingStates: { createSolution: isCreatingSolution } 
  } = useSolutionsStore();

  // CAMBIO 1: useEffect Inteligente
  // Solo actualizamos localSolutions si la prop 'solutions' trae ALGO NUEVO o diferente.
  // Esto evita que un re-render del padre con datos viejos nos borre lo que agregamos a mano.
  useEffect(() => {
    if (isOpen && Array.isArray(solutions)) {
      setLocalSolutions(prevLocal => {
        // Si tenemos más soluciones locales que las que vienen por props (porque acabamos de crear una),
        // y la prop no parece haber cambiado (misma longitud), mantenemos la local.
        if (prevLocal.length > solutions.length) {
            return prevLocal; 
        }

        // De lo contrario, sincronizamos y ordenamos con lo que venga de props
        const sorted = [...solutions].sort((a, b) => 
          new Date(b.created_at) - new Date(a.created_at)
        );
        return sorted;
      });
    }
  }, [solutions, isCreatingSolution]); 
//console.log('solutions', solutions);

 

  const handleSubmitSolution = async () => {
    if (!solutionText.trim()) return;

    const now = new Date();
    const formattedDateTime = now.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' });

    try {
      const response = await createSolution(businessUuid, {
        name: `Solución para ${evento.mensaje} - ${formattedDateTime}`,
        description: solutionText,
        business_uuid: businessUuid,     
        event_uuid: evento.event_uuid,
        user_id: user?.uuid,
      });
     // console.log('response', response);
      
      if (response && response.success) {
        toast.success('Solución registrada con éxito');
        setSolutionText('');

        // CAMBIO 2: Construcción Robusta del Objeto UI
        // El endpoint devuelve 'item' con ids, pero la UI necesita 'solver' (nombre/email)
        const newSolutionForUI = {
          ...response.item, 
          // Forzamos los campos que usa tu lista para mostrar info
          uuid: response.item.uuid, 
          description: response.item.description,
          // Usamos datos del usuario logueado porque el backend solo devolvió el ID
          solver: user?.email || user?.first_name || 'Yo', 
          created_at: response.item.created_at || new Date().toISOString()
        };

        // CAMBIO 3: Actualización Funcional (Functional Update)
        // Usamos (prev => ...) para asegurarnos de tener la versión más reciente del estado
        // y evitar problemas de closure.
        setLocalSolutions(prevSolutions => {
            const newList = [newSolutionForUI, ...prevSolutions];
            // Ordenamos de nuevo por seguridad
            return newList.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        });
      }
    } catch (error) {
      console.error('Error al registrar la solución:', error);
      toast.error('Error al guardar la solución');
    }
  };

  // Verificamos si el texto está vacío o solo tiene espacios
  const isTextEmpty = !solutionText || !solutionText.trim();

  return (
    <ModalTemplate      
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`Detalle del evento`}
      buttons={[
        ...(evento?.triggered == 1 ? [
          { 
            title: isCreatingSolution ? 'Guardando...' : 'Guardar Solución', 
            onClick: handleSubmitSolution,
            // Bloqueamos si está vacío o enviando
            disabled: isTextEmpty || isCreatingSolution,
            type: 'primary'
          }
        ] : []),
        { title: 'Cerrar', onClick: onRequestClose }
      ]}
    >      
        {!solutions && !localSolutions.length ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>            
             <LoadingSpinner />
          </div>
        ) : (
          <>
            {/* ... Sección de Info del Evento (igual que antes) ... */}
            <p><strong>Fecha:</strong> {evento?.fecha}</p>        
            <p><strong>Mensaje:</strong> {evento?.mensaje}</p>
            <p><strong>Evento:</strong> {evento?.evento}</p>
            <p><strong>Usuarios notificados:</strong></p>
            <ul className={styles.usersList}>
              {evento?.notified_users?.map((u, i) => (
                <li key={i}>
                  {u.user_email || u.email} - {u.seen_at ? 'Vista' : 'No Vista'}
                </li>
              ))}
            </ul>

            {evento?.triggered == 1 && (
              <>
                <div className={styles.newSolutionContainer}>
                  <p><strong>Agregar nueva solución:</strong></p>
                  <textarea 
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    placeholder="Describe la solución implementada..."
                    className={styles.solutionTextarea}
                    rows={4}
                    // Opcional: deshabilitar mientras se envía
                    disabled={isCreatingSolution}
                  />
                  {/* Feedback visual si intenta enviar vacío */}
                  {isTextEmpty && solutionText.length > 0 && (
                    <small style={{color: 'red'}}>La descripción no puede estar vacía.</small>
                  )}
                </div>

                {localSolutions?.length > 0 && (
                  <div className={styles.solutionsContainer}>
                    <p><strong>Soluciones anteriores ({localSolutions.length}):</strong></p>
                    <ul className={styles.solutionsList}>
                      {localSolutions.map((solution, i) => (
                        // Usamos solution.uuid si existe, sino un fallback
                        <li key={solution.uuid || i}>
                          <p className={styles.solutionText}>
                             <strong>{solution.name || solution.title}:</strong> {solution.description}
                          </p>
                          <p className={styles.solutionMeta}>                            
                            {/* Manejamos la diferencia entre backend (solver) y UI nueva */}
                            Por: {solution.solver || solution.user_email || 'Usuario'} - 
                            {new Date(solution.created_at).toLocaleString()}
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