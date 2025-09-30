import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import BtnCallToAction from "../BtnCallToAction/BtnCallToAction.jsx";
import { useAuthStore } from "../../store/authStore";

const Header = () => {
  const [navbarVisible, setNavbarVisible] = useState(false);
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const location = useLocation();
  const navigate = useNavigate();

  const menuBtnHandler = () => {
    setNavbarVisible(!navbarVisible);
  }

  const handlerLogOut = (e) => {
    e.preventDefault();
    logout();
    navigate('/');
  }

  //console.log('User in Header:', user);
  

  return (
    <header className={styles.header}>
      <img src={`/images/mdvsrl-logo.jpg`} className={styles.headerImg} />
      {user ? (
        <>
          <nav className={`${styles.navbar} ${navbarVisible ? styles.navbarShow : ''}`}>
            <button className={styles.headerBtnIcon} onClick={menuBtnHandler}>
              <img
                src={`/icons/times-solid.svg`}
                className={`${styles.headerIcon} ${styles.closeMenuBtn}`}
              />
            </button>
            <Link to="/" className={`${styles.headerLink} ${location.pathname === '/' ? styles.headerLinkSelected : ''}`} id='inicio' onClick={menuBtnHandler}>
              INICIO
            </Link>
            <Link to="/panel" className={`${styles.headerLink} ${location.pathname === '/panel' ? styles.headerLinkSelected : ''}`} id='panel' onClick={menuBtnHandler}>
              PANEL DE CONTROL
            </Link>
            <Link to={`/panel/usuarios/${user.uuid}/alarmas`} className={`${styles.headerLink} ${location.pathname.split('/').pop() === 'alarmas' ? styles.headerLinkSelected : ''}`} id='alarmas' onClick={menuBtnHandler}>
              ALARMAS
            </Link>
            {/* panel/ubicaciones/:businessUuid/usuarios/:userId */}
            <Link to={`/panel/ubicaciones/${user.businesses_roles[0].uuid}/usuarios/${user.uuid}`} 
              className={`${styles.headerLink} ${location.pathname.split('/')[location.pathname.split('/').length-2] === 'usuarios' ? styles.headerLinkSelected : ''}`} 
              id='usuarios' onClick={menuBtnHandler}>
              {`${user.first_name} ${user.last_name}`}
            </Link>
            <BtnCallToAction
              text="Salir"
              icon="sign-out-alt-solid-white.svg"
              type="danger"
              url="/"
              onClick={handlerLogOut}
            />
          </nav>
          <button className={styles.headerBtnIcon} onClick={menuBtnHandler}>
            <img
              src={`/icons/bars-solid.svg`}
              className={styles.headerIcon}
            />
          </button>
        </>
      ) : (
        <>
          <nav className={`${styles.navbar} ${navbarVisible ? styles.navbarShow : ''}`}>
            <button className={styles.headerBtnIcon} onClick={menuBtnHandler}>
              <img
                src={`/icons/times-solid.svg`}
                className={`${styles.headerIcon} ${styles.closeMenuBtn}`}
              />
            </button>
            <Link to="/" className={`${styles.headerLink} ${location.pathname === '/' ? styles.headerLinkSelected : ''}`} id='inicio' onClick={menuBtnHandler}>
              INICIO
            </Link>
            <Link to="/contacto" className={`${styles.headerLink} ${location.pathname === '/contacto' ? styles.headerLinkSelected : ''}`} id='contacto' onClick={menuBtnHandler}>
              CONTACTO
            </Link>
            <BtnCallToAction
              text="Ingresar"
              icon="user-regular.svg"
              type="normal"
              url="ingresar"
              onClick={menuBtnHandler}
            />
          </nav>
          <button className={styles.headerBtnIcon} onClick={menuBtnHandler}>
            <img
              src={`/icons/bars-solid.svg`}
              className={styles.headerIcon}
            />
          </button>
        </>
      )}
    </header>
  );
};

export default Header;
