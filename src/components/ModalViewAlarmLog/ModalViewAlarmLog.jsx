import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useSolutionsStore } from '../../store/solutionsStore';
import ModalTemplate from '../ModalTemplate/ModalTemplate';
import styles from './ModalViewAlarmLog.module.css';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner'; 
import toast from 'react-hot-toast';
import { FormatearFechaCompleta } from '../../utils/FormatearFechaCompleta';
import { Title2 } from '../Title2/Title2';

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
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);


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
    //console.log('user', user);
    // console.log('evento', evento);


 

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
// console.log('evento', evento);
// console.log('user', user);


  return (
    <ModalTemplate      
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      title={`Detalles del evento`}
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
            {
              (evento.triggered == 1) ? (
                <div className={`${styles.icon_event} ${styles.color_danger}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="currentColor" d="M256 32c14.2 0 27.3 7.5 34.5 19.8l216 368c7.3 12.4 7.3 27.7 .2 40.1S486.3 480 472 480L40 480c-14.3 0-27.6-7.7-34.7-20.1s-7-27.8 .2-40.1l216-368C228.7 39.5 241.8 32 256 32zm0 128c-13.3 0-24 10.7-24 24l0 112c0 13.3 10.7 24 24 24s24-10.7 24-24l0-112c0-13.3-10.7-24-24-24zm32 224a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"/>
                  </svg>
                  <h3 className={styles.title_event}>Alarma Disparada</h3>
                </div>
              ) : (
                <div className={`${styles.icon_event} ${styles.color_success}`}>                   
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                      <path fill="currentColor" d="M386.3 160L336 160c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32l0-128c0-17.7-14.3-32-32-32s-32 14.3-32 32l0 51.2L414.4 97.6c-87.5-87.5-229.3-87.5-316.8 0s-87.5 229.3 0 316.8s229.3 87.5 316.8 0c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0c-62.5 62.5-163.8 62.5-226.3 0s-62.5-163.8 0-226.3s163.8-62.5 226.3 0L386.3 160z"/>
                    </svg>                 
                  <h3 className={styles.title_event}>Alarma Reseteada</h3>
                </div>
              )
            }

            <h3 className={styles.subtitle_event}>{evento?.mensaje}</h3>
            <p><strong>{FormatearFechaCompleta(evento?.triggered_at)}</strong></p>        
            
            <div className={styles.users_container}>
              {/* <h3 className={styles.subtitle_event}><strong>Usuarios notificados:</strong></h3> */}
              <Title2 text="Usuarios notificados:" type="contacto"/>
              <ul className={styles.usersList}>
                {evento?.notified_users?.map((u, i) => (
                  <li key={i} className={!u.seen_at ? styles.color_danger_light_bg : styles.color_success_light_bg}>
                    <span className={styles.user_name}>{u.first_name}  {u.last_name}</span>
                    <span>({u.email})</span>
                    <span>{u.seen_at ? 'Vista' : 'No Vista'}</span>
                  </li>
                ))}
              </ul>
            </div>

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