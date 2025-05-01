import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import BtnCallToAction from '../../components/BtnCallToAction/BtnCallToAction';
import {Title1} from '../../components/Title1/Title1';
import styles from './Home.module.css';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();     
  if (user) {
    //navigate('/panel');
    return (
      <>
      <Title1 text={`Bienvenido ${user.nombre_1} ${user.apellido_1}`}
          type="usuarios"/>
        <Breadcrumb />
      <main className={styles.pageMaincontent}>
        <p className={styles.pageMaincontentParagraph}>Ahora podes:</p>
        <div className={styles.actionButtons}>
          <BtnCallToAction
            text="Ir al panel de control"
            icon="columns-solid.svg"
            type="normal"
            url={`panel`} />
          <BtnCallToAction
            text="Ver tus alarmas"
            icon="clock-regular.svg"
            type="normal"
            url={`panel/usuarios/${user.id}/alarmas`} />
          <BtnCallToAction
            text="Ver tus dataloggers"
            icon="microchip-solid.svg"
            type="normal"
            url={`panel/dataloggers/`} />
          <BtnCallToAction
            text="Ver tu perfil"
            icon="user-regular.svg"
            type="normal"
            url={`panel/usuarios/${user.id}`} />
          <BtnCallToAction
            text="Enviarnos un mensaje"
            icon="envelope-regular.svg"
            type="normal"
            url={`/contacto`} />

        </div>
        </main>

      </>
    )
  }
 
  return (
    <main className={styles.pageMaincontent}>
        <Title1 text="Bienvenidos a MDV Sensores!." type="inicio" />
                  
          <h3>
            📊 Optimiza el control de tus equipos críticos con nuestro sistema
            de monitoreo 24/7 🌍
          </h3>

          <p className={styles.pageMaincontentParagraph}>
            Nuestro sistema de <strong> administración de dataloggers </strong> está diseñado para
            clínicas, hospitales y cualquier organización que necesite
            supervisar parámetros clave en tiempo real. </p>
          <p className={styles.pageMaincontentParagraph}>
            🕒 <strong>Configura alarmas </strong>
            para recibir notificaciones inmediatas si algo sale de los valores
            normales, genera informes personalizados y accede a <strong> gráficos
            detallados </strong> que te ayudarán a mantener tus equipos electromecánicos
            siempre en óptimas condiciones.
          </p>

          <p className={styles.pageMaincontentParagraph}>
            💡 <strong>Evita fallos</strong>, mejora el rendimiento y asegura la continuidad
            operativa de tus sistemas.
          </p>
          <p className={styles.pageMaincontentParagraph}>
            🔗 Si ya tenés las credenciales, empezá a probar la demo:  
            <BtnCallToAction
              text="Ingresar"
              icon="user-regular.svg"
              type="normal"
              url={`ingresar`}                                        
            />
            <br />
            ❓ ¿No tenés credenciales? Contactanos ahora y te ayudaremos a comenzar.
            <BtnCallToAction
              text="Contacto"
              icon="envelope-regular.svg"
              type="normal"
              url={`contacto`}                                        
            />
          </p>
        
      </main>
  );
};

export default Home;