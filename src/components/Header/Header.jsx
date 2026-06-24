import { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import styles from "./Header.module.css";
import BtnCallToAction from "../BtnCallToAction/BtnCallToAction.jsx";
import { useAuthStore } from "../../store/authStore";

const Header = () => {
  const [navbarVisible, setNavbarVisible] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
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

  const getCurrentBusiness = () => {
    if (!user?.businesses_roles?.length) return null;
    const segments = location.pathname.split('/');
    for (const seg of segments) {
      const match = user.businesses_roles.find(br => br.uuid === seg);
      if (match) return match;
    }
    return user.businesses_roles[0];
  };

  const handleLocationSelect = (business) => {
    setLocationDropdownOpen(false);
    setNavbarVisible(false);
    navigate(`/panel/ubicaciones/${business.uuid}`);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLocationDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentBusiness = getCurrentBusiness();

  return (
    <header className={styles.header}>
      <Link to="/"><img src={`/images/mdvsrl-logo.jpg`} className={styles.headerImg} /></Link>
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
            <Link to={`/panel/alarmas/${user.uuid}`} className={`${styles.headerLink} ${location.pathname.startsWith('/panel/alarmas') ? styles.headerLinkSelected : ''}`} id='misAlarmas' onClick={menuBtnHandler}>
              MIS ALARMAS
            </Link>
            {user?.businesses_roles?.length > 1 && (
              <div className={styles.locationSelector} ref={dropdownRef}>
                <button
                  className={`${styles.headerLink} ${styles.locationBtn}`}
                  onClick={() => setLocationDropdownOpen(!locationDropdownOpen)}
                >
                  <span>{currentBusiness?.name || 'Ubicaciones'}</span>
                  <span className={`${styles.chevronIcon} ${locationDropdownOpen ? styles.chevronOpen : ''}`}>&#9660;</span>
                </button>
                {locationDropdownOpen && (
                  <div className={styles.locationDropdown}>
                    {user.businesses_roles.map(br => (
                      <button
                        key={br.uuid}
                        className={`${styles.locationItem} ${br.uuid === currentBusiness?.uuid ? styles.locationItemActive : ''}`}
                        onClick={() => handleLocationSelect(br)}
                      >
                        <span className={styles.locationItemName}>{br.name}</span>
                        <span className={styles.locationItemRole}>{br.role}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* panel/ubicaciones/:businessUuid/usuarios/:userId */}
            <Link to={`/panel/ubicaciones/${user?.businesses_roles[0]?.uuid}/usuarios/${user?.uuid}`}
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
              src={`/icons/bars-solid.svg`
              }
              className={styles.headerIcon}
            />
          </button>
        </>
      )}
    </header>
  );
};

export default Header;
