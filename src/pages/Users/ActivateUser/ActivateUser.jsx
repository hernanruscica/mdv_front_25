import { useEffect, useState } from "react";
import { Title1 } from "../../../components/Title1/Title1.jsx";
import { useParams } from "react-router-dom";
import ResetPassword from "./ResetPassword.jsx";
import styles from "../SendActivationEmail/SendActivationEmail.module.css";
import { jwtDecode } from "jwt-decode";

const ActivateUser = () => {
  const { token } = useParams(); 
  const [currentUser, setCurrentUser] = useState({id: '', dni: '', userName: ''});    
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  

  const loadCurrentUserData = async (token) => {
    try {
      setLoading(true);      
      const decodedToken = jwtDecode(token);      
      
      if (!decodedToken) {
        throw new Error('Token inválido o expirado');
      }
      
      setCurrentUser({
        userName: decodedToken.user_first_name + ' ' + decodedToken.user_last_name, 
        dni: decodedToken.dni, 
        uuid: decodedToken.uuid
      });
    } catch (error) {
      setError(error.message || 'Error al activar el usuario');
      console.error('Error al cargar datos del usuario:', error);
    } finally {
      setLoading(false);
    }
  }
  
  useEffect(() => {   
    loadCurrentUserData(token);
  }, []);     

  if (loading) {   
    return <div>Cargando...</div>;
  }

  if (error) {
    return (
      <main className={styles.pageMaincontent}>
        <div className={styles.error_message}>
          {error}
        </div>
      </main>
    );
  }
  
  return (
    <main className={styles.pageMaincontent}>
      <Title1     
        type="usuarios"   
        text={`Reseteo de contraseña`}
      />
      <p className="page__maincontent__p">{`Reseteo de contraseña para ${currentUser?.userName || ''} con D.N.I.: ${currentUser?.dni}`}</p>
       <ResetPassword token={token}/>       
      
    </main>
  );
};

export default ActivateUser;
