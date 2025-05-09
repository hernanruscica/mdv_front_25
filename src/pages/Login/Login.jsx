import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './Login.module.css';
import { Title1 } from '../../components/Title1/Title1.jsx';
import { useAuthStore } from '../../store/authStore';
import { LoadingSpinner } from '../../components/LoadingSpinner/LoadingSpinner';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const login = useAuthStore(state => state.login);
  
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const resetForm = () => {
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const isLoggedIn = await login(username, password);    
      if (isLoggedIn) {
        toast.success('Credenciales correctas');
        navigate('/');
      } else {
        toast.error('DNI y/o contraseña incorrectos');
        resetForm();
      }
    } catch (error) {
      toast.error('Error al intentar iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <main className={styles.pageMaincontent}>
        <LoadingSpinner message="Iniciando sesión..." />
      </main>
    );
  }

  return (
    <main className={styles.pageMaincontent}>
      <Title1 
        text='Página de ingreso'
        type='usuarios'
      />
      <form onSubmit={handleSubmit} className={styles.loginForm}>
        <p>🔐 Introduzca sus credenciales para ingresar a la aplicación.</p>      
        <div className={styles.loginFormInputRow}>
            <label htmlFor="dni" className={styles.loginFormLabel}>DNI.:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              id='dni'
              placeholder="Ingrese su D.N.I."
            />
        </div>
        <div className={styles.loginFormInputRow}>
          <label htmlFor="password" className={styles.loginFormLabel}>Contraseña.:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            id='password'
            placeholder="Ingrese su contraseña"
          />
        </div>
        <p>😕 Se olvidó la contraseña?<br/><Link to='/panel/usuarios/resetear'>Haga CLICK ACÁ para restablecerla</Link></p>
        
        <button className={styles.loginFormBtn} type="submit">Ingresar</button>
      </form>      
    </main>
  );
};

export default Login;