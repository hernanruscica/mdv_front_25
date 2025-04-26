import React from 'react';
import { Link } from 'react-router-dom';
import CardTitle from '../CardTitle/CardTitle';
import CardBtnSmall from '../CardBtnSmall/CardBtnSmall';
import styles from './CardImage.module.css';

const CardImage = ({ image, title, children, buttons }) => {
  return (
    <div className={styles.card}>
      <div className={styles.card__imageContainer}>
        <img className={styles.card__image} src={image} alt="Card Image" />
      </div>
      <div className={styles.card__mainContent}>
        <h1 className={styles.card__title}>{title}</h1>
        <div className={styles.card__children}>
          {children}
        </div>
        {buttons && (
          <div className={styles.card__buttonsContainer}>
            {buttons}
          </div>
        )}
      </div>
    </div>
  );
};

export default CardImage;