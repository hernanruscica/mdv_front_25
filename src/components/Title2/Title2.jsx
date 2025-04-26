import React from 'react'
import styles from './Title2.module.css';
import { getIconFileName } from '../../utils/iconsDictionary';

export const Title2 = (props) => {
  const baseUrl = import.meta.env.VITE_APP_URL;
  const { text, type } = props;    
    const iconUrl = `/icons/${getIconFileName(type)}`;
    
    return (
        <div className={styles.title2Container}>
            <img src={iconUrl} 
                 alt={`Icono de ${type}`} 
                 className={styles.title2Img}/>  
            <h2 className={styles.title2Text}>{text}</h2>
        </div>
    )
}
