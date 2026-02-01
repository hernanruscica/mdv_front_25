import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './Login.module.css';
import { Title1 } from '../../components/Title1/Title1.jsx';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Estado para el ojo
  const [isLoading, setIsLoading] = useState(false);
  
  const login = useAuthStore(state => state.login);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const urlParams = new URLSearchParams(window.location.search);
  const redirect = urlParams.get('redirect') || null;

  useEffect(() => {
    if (user) {    
      navigate(redirect || '/panel');
    }
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);    
      if (success) {
        toast.success('Sesión iniciada correctamente');
        navigate(redirect || '/panel');
      } else {
        toast.error('DNI y/o contraseña incorrectos');
        setPassword('');
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  if (isLoading) {
    return (
      <main className={styles.pageMaincontent}>
        <LoadingSpinner message="Validando credenciales..." />
      </main>
    );
  }

  return (
    <main className={styles.pageMaincontent}>
      <Title1 
        text='Ingreso al Sistema'
        type='usuarios'
      />
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <p className={styles.formInstruction}>
          Introduzca sus credenciales autorizadas para acceder a la plataforma de monitoreo.
        </p>      
        
        <div className={styles.loginFormInputRow}>
            <label htmlFor="dni" className={styles.loginFormLabel}>DNI</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id='dni'
              placeholder="Número de documento"
              required
            />
        </div>

        <div className={styles.loginFormInputRow}>
          <label htmlFor="password" className={styles.loginFormLabel}>Contraseña</label>
          <div className={styles.passwordWrapper}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              id='password'
              placeholder="Clave de acceso"
              required
            />
            <button 
              type="button" 
              className={styles.eyeBtn} 
              onClick={togglePasswordVisibility}
              tabIndex="-1"
            >
              <img 
                src={showPassword ? "/icons/eye-slash-regular.svg" : "/icons/eye-regular.svg"} 
                alt="Mostrar/Ocultar" 
              />
            </button>
          </div>
        </div>

        <div className={styles.formFooter}>
          <p className={styles.forgotPassword}>
            ¿Ha olvidado su contraseña? <br/>
            <Link to='/resetear'>Solicite el restablecimiento aquí</Link>
          </p>
          <button className={styles.loginFormBtn} type="submit">Iniciar Sesión</button>
        </div>
      </form>      
    </main>
  );
};

export default Login;