import { Link } from 'react-router-dom';

import styles from './CardInfo.module.css';

const CardInfo = ({ iconSrc, title, url, children, size = 'normal' }) => {
  return (
    <div className={`${styles.cardBase} ${size === 'large' ? styles.cardLarge : styles.card}`}>
      <div className={styles.headerWrapper}>        
         <div className={styles.title}>
            <img src={iconSrc} alt={title} className={styles.icon} />
            <span className={styles.text}>{title}</span>
          </div>
      </div>

      <div className={styles.bodyContent}>
        {children}
      </div>

      <Link 
        to={url}
        className={styles.btn}
      >
        <img 
          src="/icons/eye-regular-white.svg" 
          alt="Ver más" 
          className={styles.btnImg}
        />
        <span className={styles.btnText}>Ver detalles</span>
      </Link>
    </div>
  );
};

export default CardInfo;