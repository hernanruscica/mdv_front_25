import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FloatingButtons.module.css';

const FloatingButtons = () => {
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Se muestra al bajar más de 300px
      setShowScrollButton(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.floatingContainer}>
      {/* Botón Volver */}
      <button 
        className={`${styles.btn} ${styles.backBtn}`}
        onClick={handleGoBack}
        title="Volver a la página anterior"
      >
        <span className={styles.icon}>←</span>
        <span className={styles.text}>Volver</span>
      </button>

      {/* Botón Subir */}
      {showScrollButton && (
        <button 
          className={`${styles.btn} ${styles.topBtn}`}
          onClick={handleScrollToTop}
          title="Ir al inicio"
        >
          <span className={styles.icon}>↑</span>
          <span className={styles.text}>Subir</span>
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;