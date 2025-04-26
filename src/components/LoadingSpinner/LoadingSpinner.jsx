import React from 'react';
import styles from './LoadingSpinner.module.css';

export const LoadingSpinner = ({ message = 'Cargando datos...' }) => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};