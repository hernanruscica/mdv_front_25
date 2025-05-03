import { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";
import { useUsersStore } from "../../../store/usersStore";
import styles from "./Form.module.css";
import Modal from "react-modal";

// Modal.setAppElement("#root");

function ResetPassword({ userId }) {
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [passwordMatchError, setPasswordMatchError] = useState('');
  const [hasUpper, setHasUpper] = useState(false);
  const [hasLower, setHasLower] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  //const [hasSymbol, setHasSymbol] = useState(false);
  const [isLongEnough, setIsLongEnough] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 
  const [loading, setLoading] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const navigate = useNavigate();
  const { updateUser } = useUsersStore();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== password2) {
      setModalMessage("Las contraseñas no coinciden.");
      setModalIsOpen(true);
      return;
    }

    if (!hasUpper || !hasLower || !hasNumber || !isLongEnough) {
      setModalMessage("La contraseña no cumple con los requisitos de seguridad.");
      setModalIsOpen(true);
      return;
    }

    try {
      setLoading(true);
      const userData = new FormData();
      userData.append("password", password);
      
      const userUpdatedOk = await updateUser(userId, userData);
      //console.log('Response en resetPassWord', response)
      if (userUpdatedOk) {
        setModalMessage(userUpdatedOk.message || "Contraseña actualizada con éxito.");
      } else {
        setModalMessage(userUpdatedOk.message || "Error al actualizar la contraseña. Usuario no encontrado.");
      }
    } catch (error) {
      console.error("Error al actualizar la contraseña:", error);
      setModalMessage("Error al actualizar la contraseña. Por favor, intente nuevamente.");
    } finally {
      setLoading(false);
      setModalIsOpen(true);
    }
  };

  const handleChangePass = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  const handleChangePass2 = (e) => {
    setPassword2(e.target.value);
  };

  const togglePasswordVisibility = () => { 
    setShowPassword(!showPassword);
  };

  useEffect(() => {
    // Validación de coincidencia de contraseñas
    if (password && password2 && password !== password2) {
      setPasswordMatchError('Las contraseñas no coinciden');
    } else {
      setPasswordMatchError('');
    }

    // Validación de complejidad de la contraseña
    setHasUpper(/[A-Z]/.test(password));
    setHasLower(/[a-z]/.test(password));
    setHasNumber(/[0-9]/.test(password));
    //setHasSymbol(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password));

    // Validación de longitud mínima
    setIsLongEnough(password.length >= 8);
  }, [password, password2]);

  const isSubmitDisabled = !password || !password2 || passwordMatchError || !hasUpper || !hasLower || !hasNumber || !isLongEnough;

  if (loading) {
    return <div>Cargando ...</div>;
  }

  const closeModal = () => {
    setModalIsOpen(false);
    navigate(`/`); 
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.form_input_group}>
          <div className={styles.form_input}>
            <label htmlFor="password">Contraseña:</label>
            <div className={styles['password-input-container']}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={password}
                onChange={handleChangePass}
              />
              <button
                type="button"
                className={styles['password-toggle-button']}
                onClick={togglePasswordVisibility}
              >
                <img
                  src={`/icons/${showPassword ? 'eye-regular.svg' : 'eye-slash-regular.svg'}`}
                  className={styles['pass-btn-icon']}
                />   
              </button>
            </div>
            <div className={styles['password-input-message']}>
              {!hasUpper && password && <label className="form_error_label">Debe contener al menos una mayúscula</label>}
              {!hasLower && password && <label className="form_error_label">Debe contener al menos una minúscula</label>}
              {!hasNumber && password && <label className="form_error_label">Debe contener al menos un número</label>}
              {!isLongEnough && password && <label className="form_error_label">Debe tener al menos 8 caracteres</label>}
            </div>
          </div>
          <div className={styles.form_input}>
            <label htmlFor="password2">Repita la Contraseña:</label>
            <div className={styles['password-input-container']}>
              <input
                type={showPassword ? "text" : "password"}
                name="password2"
                id="password2"
                value={password2}
                onChange={handleChangePass2}
              />
              <button
                type="button"
                className={styles['password-toggle-button']}
                onClick={togglePasswordVisibility}
              >
                <img
                  src={`/icons/${showPassword ? 'eye-regular.svg' : 'eye-slash-regular.svg'}`}
                  className={styles['pass-btn-icon']}
                />                
              </button>
            </div>
            <div className={styles['password-input-message']}>
              {passwordMatchError && <label className="form_error_label">{passwordMatchError}</label>}
            </div>
          </div>
        </div>

        <button type="submit" className={styles.form_btn} disabled={isSubmitDisabled}>
          Guardar cambios
        </button>
      </form>

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Mensaje del sistema"
        style={{
          content: {
            top: "50%",
            left: "50%",
            right: "auto",
            bottom: "auto",
            marginRight: "-50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center"
          },
        }}
      >
        <h2>Información</h2>
        <p>{modalMessage}</p>
        <button className={styles.form_btn} onClick={closeModal}>
          Cerrar
        </button>
      </Modal>
    </>
  );
}

export default ResetPassword;