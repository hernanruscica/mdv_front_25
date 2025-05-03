import React, { useEffect, useState } from "react";
import { Title1 } from "../../../components/Title1/Title1.jsx";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../../store/authStore.js";
import ResetPassword from "./ResetPassword.jsx";
import styles from "../SendActivationEmail/SendActivationEmail.module.css";

const ActivateUser = () => {
  const { token } = useParams(); 
  const [currentUser, setCurrentUser] = useState({id: '', dni: '', userName: ''});    
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { activateUser } = useAuthStore();

  const loadCurrentUserData = async (token) => {
    try {
      setLoading(true);
      const response = await activateUser(token);
      
      if (!response.success) {
        throw new Error(response.message);
      }
      
      setCurrentUser({
        userName: response.userName, 
        dni: response.dni, 
        userId: response.userId
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
       <ResetPassword userId={currentUser.userId}/>       
      
    </main>
  );
};

export default ActivateUser;
