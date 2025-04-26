import React from 'react';
import styles from './CardTitle.module.css';

const CardTitle = ({ iconSrc, text }) => {
  return (
    <div className={styles.title}>
      <img src={iconSrc} alt={text} className={styles.icon} />
      <span className={styles.text}>{text}</span>
    </div>
  );
};

export default CardTitle;