import { Link } from 'react-router-dom';
import styles from './BtnSmall.module.css';

const BtnSmall = ({ text, icon, type = 'warning', url, onClick }) => {
  const className = `${styles.btnSmall} ${styles[`btnSmall--${type}`]}`;

  if (onClick) {
    return (
      <button type="button" className={className} onClick={onClick}>
        {icon && <img src={`/icons/${icon}`} className={styles.btnSmallIcon} alt="" />}
        <span>{text}</span>
      </button>
    );
  }

  return (
    <Link to={url ? url : '#'} className={className}>
      {icon && <img src={`/icons/${icon}`} className={styles.btnSmallIcon} alt="" />}
      <span>{text}</span>
    </Link>
  );
};

export default BtnSmall;
