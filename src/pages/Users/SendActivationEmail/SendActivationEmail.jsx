import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Title1 } from "../../../components/Title1/Title1";
import { useAuthStore } from '../../../store/authStore';
import styles from './SendActivationEmail.module.css';

const SendActivationEmail = () => {
  const [email, setEmail] = useState('');
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);
  
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [emailFound, setEmailFound] = useState(false);
  const navigate = useNavigate();
  const { sendActivationEmail } = useAuthStore();
  
  const handleChangeEmail = (e) => {
    //console.log('Click en email input');
    const newEmail = e.target.value;
    setEmail(newEmail);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsSubmitDisabled(!emailRegex.test(newEmail));
  }

  const handleEmail = async (email) => {
    try {
      setLoading(true);
      setIsModalOpen(true);
      setModalMessage('Revisando dirección de correo...');
      
      const response = await sendActivationEmail(email);
      
      if (response?.emailExists) {
        setModalMessage('Correo electrónico encontrado. Revise su casilla de correo.');
        setEmailFound(true);
      } else {
        setModalMessage('Correo electrónico no encontrado.');
        setEmailFound(false);
      }
    } catch (error) {
      console.error("Error al verificar el correo:", error);
      setModalMessage('Error al verificar el correo electrónico.');
      setEmailFound(false);
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    handleEmail(email);
  }

  const handleAcceptModal = () => {
    setIsModalOpen(false);
    if (emailFound) {
      navigate('/');
    }
  }

  return (
    <main className={styles.pageMaincontent}>
      <Title1
        type="usuarios"
        text={`Olvido de contraseña`}
      />
      <p className={styles.pageMaincontentP}>📧 En esta página podrá solicitar un reenvio del correo electrónico de cambio de contraseña</p>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formInputGroup}>
          <div className={styles.formInput}>
            <label htmlFor="email">Correo Electrónico:</label>
            <div className={styles.passwordInputContainer}>
              <input
                type="email"
                name="email"
                id="email"
                value={email}
                onChange={handleChangeEmail}
              />
            </div>
          </div>
          <div className={styles.formInput}>
            <button type="submit" className={styles.formBtn} disabled={isSubmitDisabled}>
              Enviar Correo
            </button>
          </div>
        </div>
      </form>

      {isModalOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <p>{modalMessage}</p>
            <button onClick={handleAcceptModal} className={styles.formBtn} >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </main>
  );
};

export default SendActivationEmail;