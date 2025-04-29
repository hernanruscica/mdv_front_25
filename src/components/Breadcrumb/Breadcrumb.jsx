import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { iconsDictionary, getIconFileName } from '../../utils/iconsDictionary';
import styles from './Breadcrumb.module.css';

const Breadcrumb = ({ usuario, datalogger, ubicacion, canal, alarma }) => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);

  const getPathName = (path) => {
    switch(path) {
      case 'panel': return 'Panel de Control';
      case 'usuarios': return 'Usuarios';
      case 'dataloggers': return 'Dataloggers';
      case 'ubicaciones': return 'Ubicaciones';
      case 'canales': return 'Canales';
      case 'alarmas': return 'Alarmas';
      case 'agregar': return 'Agregar';
      case 'edicion': return 'Edición';
      default: return path;
    }
  };

  const getCustomName = (path, index, paths) => {
    // Si el path anterior es uno de los tipos conocidos, verificamos si tenemos un prop correspondiente
    const prevPath = paths[index - 1];
    
    if (prevPath === 'usuarios' && usuario) return usuario;
    if (prevPath === 'dataloggers' && datalogger) return datalogger;
    if (prevPath === 'ubicaciones' && ubicacion) return ubicacion;
    if (prevPath === 'canales' && canal) return canal;
    if (prevPath === 'alarmas' && alarma) return alarma;
    
    return getPathName(path);
  };

  useEffect(() => {
    const paths = location.pathname.split('/').filter(path => path);
    const breadcrumbItems = paths.map((path, index) => {
      const type = iconsDictionary[path] ? path : paths[index - 1] || path;
      const name = getCustomName(path, index, paths);
      const icon = getIconFileName(type);
      const url = `/${paths.slice(0, index + 1).join('/')}`;
      
      return {
        name,
        url,
        icon,
        isLast: index === paths.length - 1
      };
    });

    setBreadcrumbs(breadcrumbItems);
  }, [location, usuario, datalogger, ubicacion, canal, alarma]);

  return (
    <div className={styles.breadcrumbContainer}>
      <nav className={styles.breadcrumb}>
        <div className={styles.breadcrumbItem}>
          <Link to="/" className={styles.breadcrumbBtn}>
            <img 
              src={`/icons/${getIconFileName('inicio')}`} 
              alt="Inicio"
              className={styles.icon}
            />
            Inicio
          </Link>
        </div>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <img 
              src="/icons/chevron-right-solid.svg"
              alt="/"
              className={styles.separator}
            />
            <div className={item.isLast ? styles.breadcrumbItemCurrent : styles.breadcrumbItem}>
              {item.isLast ? (
                <span className={styles.breadcrumbBtn}>
                  <img 
                    src={`/icons/${item.icon}`} 
                    alt={item.name}
                    className={styles.icon}
                  />
                  {item.name}
                </span>
              ) : (
                <Link to={item.url} className={styles.breadcrumbBtn}>
                  <img 
                    src={`/icons/${item.icon}`} 
                    alt={item.name}
                    className={styles.icon}
                  />
                  {item.name}
                </Link>
              )}
            </div>
          </React.Fragment>
        ))}
      </nav>
    </div>
  );
};

export default Breadcrumb;