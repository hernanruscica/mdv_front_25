import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './FloatingButtons.module.css';

const FloatingButtons = () => {
  const navigate = useNavigate();
  const [showScrollButton, setShowScrollButton] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const halfViewportHeight = window.innerHeight / 2;
      setShowScrollButton(window.scrollY > halfViewportHeight);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={styles.floatingButtonsContainer}>
      <button 
        className={`${styles.floatingButton} ${styles.backButton}`}
        onClick={handleGoBack}
        aria-label="Atrás"
      >
        ← Atrás
      </button>
      {showScrollButton && (

        <button 
          className={`${styles.floatingButton} ${styles.topButton}`}
          onClick={handleScrollToTop}
          aria-label="Arriba"
        >
          ↑ Arriba
        </button>
      )}
    </div>
  );
};

export default FloatingButtons;