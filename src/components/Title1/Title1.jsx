import React from 'react'
import styles from './Title1.module.css';
import { getIconFileName } from '../../utils/iconsDictionary';

export const Title1 = (props) => {
  const baseUrl = import.meta.env.VITE_APP_URL;
  const { text, type } = props;    
    const iconUrl = `/icons/${getIconFileName(type)}`;
    
    return (
        <div className={styles.title1Container}>
            <img src={iconUrl} 
                 alt={`Icono de ${type}`} 
                 className={styles.title1Img}/>  
            <h1 className={styles.title1Text}>{text}</h1>
        </div>
    )
}
