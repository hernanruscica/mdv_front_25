import React from 'react'
import { Link } from "react-router-dom";
import styles from './BtnCallToAction.module.css';

const BtnCallToAction = (props) => {
    const { text, icon, type, url, onClick } = props;
    return (
      <Link
        to={url ? url : '#'}   
        onClick={onClick ? onClick : ''}     
        className={`${styles.navbarBtn} ${styles[`navbarBtn--${type}`]}`}
      >
        <img
          src={`/icons/${icon}`}
          className={styles.navbarBtnIcon}
        />
        <span className={styles.navbarBtnText}>{text}</span>
      </Link>
    );
}

export default BtnCallToAction