import React from 'react';
import { Title1 } from '../../components/Title1/Title1';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import styles from './UnderConstruction.module.css';

const UnderConstruction = () => {
  return (     
    <>
      <Title1 
        text={`Página en construcción`}
        type="construccion"
      />   
      <p className={styles.paragraph}>
        Esta página está en construcción. Volve más tarde para ver las actualizaciones.
      </p>
      <p className={styles.paragraph}>
        Podes volver atrás con el botón de <strong>[atrás]</strong> de la aplicación o        
      </p>
      <BtnCallToAction 
          icon = "columns-solid.svg"
          text="Panel de control"
          type="primary"
          url="/"
        />
      <p className={styles.paragraph}>
        Estamos trabajando para usted. 
      </p>
    </>
  );
};

export default UnderConstruction;