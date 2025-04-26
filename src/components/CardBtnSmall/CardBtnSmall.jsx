import React from 'react';
import { Link } from 'react-router-dom';
import styles from './CardBtnSmall.module.css';

const CardBtnSmall = ({ title, url, onClick }) => {
  if (onClick) {
    return (
      <button 
        className={styles.cardBtnSmall} 
        onClick={onClick}
      >
        {title}
      </button>
    );
  }

  return (
    <Link 
      to={url} 
      className={styles.cardBtnSmall}
    >
      {title}
    </Link>
  );
};

export default CardBtnSmall;