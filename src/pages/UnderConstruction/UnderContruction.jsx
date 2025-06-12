import React from 'react';
import { Title1 } from '../../components/Title1/Title1';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';

const UnderConstruction = () => {
  return (     
    <>
      <Title1 
        text={`Página en contrucción`}
        type="construccion"
      />   
      <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
        Esta página está en construcción. Volve más tarde para ver las actualizaciones.
      </p>
      <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
        Podes volver atras con el botón de <strong>[atrás]</strong> de la aplicacion o        
      </p>
      <BtnCallToAction 
          icon = "columns-solid.svg"
          text="Panel de control"
          type="primary"
          url="/"
        />
      <p style={{ textAlign: 'center', fontSize: '1.2rem' }}>
        Estamos trabajando para usted. 
      </p>
    </>
  );
};

export default UnderConstruction;