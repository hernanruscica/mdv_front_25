import React from 'react';
import { Link } from 'react-router-dom';
import CardTitle from '../CardTitle/CardTitle';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import styles from './CardInfo.module.css';

const CardInfo = ({ iconSrc, title, url, children, size = 'normal' }) => {
  return (
    <div className={(size === 'large') ? styles.cardLarge : styles.card}>
      <CardTitle 
        iconSrc={iconSrc}
        text={title}
      />
      {children}
      <Link 
        to={url}
        className={styles.btn}
      >
        <img 
          src="/icons/eye-regular-white.svg" 
          alt="Ver más" 
          className={styles.btnImg}
        />
        <span className={styles.btnText}>Ver más</span>
      </Link>
    </div>
  );
};

export default CardInfo;