import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { iconsDictionary, getIconFileName } from '../../utils/iconsDictionary';
import { useUsersStore } from '../../store/usersStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useLocationsStore } from '../../store/locationsStore';
import styles from './Breadcrumb.module.css';

const Breadcrumb = () => {
  const location = useLocation();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  
  const { selectedUser } = useUsersStore();
  const { selectedDatalogger } = useDataloggersStore();
  const { selectedLocation } = useLocationsStore();

  const getEntityName = (type, id) => {
    switch(type) {
      case 'usuarios':
        return selectedUser?.nombre_1 
          ? `${selectedUser.nombre_1} ${selectedUser.apellido_1}`
          : id;
      case 'dataloggers':
        return selectedDatalogger?.nombre || id;
      case 'ubicaciones':
        return selectedLocation?.nombre || id;
      default:
        return id;
    }
  };

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

  useEffect(() => {
    const paths = location.pathname.split('/').filter(path => path);
    const breadcrumbItems = paths.map((path, index) => {
      const isId = path.match(/^[0-9a-fA-F-]+$/);
      // Fix: Use current path for type if it exists in iconsDictionary
      const type = iconsDictionary[path] ? path : paths[index - 1] || path;
      const name = isId ? getEntityName(type, path) : getPathName(path);
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
  }, [location, selectedUser, selectedDatalogger, selectedLocation]);

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