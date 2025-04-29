import React from 'react';
import styles from './CustomTag.module.css';

const CustomTag = ({ text, type = 'archive', icon }) => {
    const currentTitleText = {
      archive: 'Este elemento se encuentra archivado',
      active: 'Activo',
      inactive: 'Inactivo',
      deleted: 'Eliminado',
    };
  return (
    <p className={styles.tag} data-type={type} title={currentTitleText[type]}>
      <img src={icon} alt={type} />
      <strong>{text}</strong>
    </p>
  );
};

export default CustomTag;