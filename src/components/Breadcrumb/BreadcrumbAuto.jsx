import React, { useEffect, useState, useRef, useMemo } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { useLocationsStore } from '../../store/locationsStore';
import { useDataloggersStore } from '../../store/dataloggersStore';
import { useChannelsStore } from '../../store/channelsStore';
import { useAlarmsStore } from '../../store/alarmsStore';
import { useUsersStore } from '../../store/usersStore';
import { useAuthStore } from '../../store/authStore';
import styles from './BreadcrumbAuto.module.css';

const PATH_LABELS = {
  'panel': 'Panel de Control',
  'ubicaciones': 'Ubicaciones',
  'usuarios': 'Usuarios',
  'dataloggers': 'Dataloggers',
  'canales': 'Canales',
  'alarmas': 'Alarmas',
  'agregar': 'Agregar',
  'editar': 'Edición',
  'ayuda': 'Ayuda',
  'tutorial-operario': 'Tutorial Operario',
  'crear-usuario': 'Crear Usuario',
};

const PATH_ICONS = {
  'panel': 'home',
  'ubicaciones': 'mapPin',
  'usuarios': 'users',
  'dataloggers': 'cpu',
  'canales': 'activity',
  'alarmas': 'alarm',
  'agregar': 'plus',
  'editar': 'edit',
  'ayuda': 'unknown',
  'tutorial-operario': 'unknown',
  'crear-usuario': 'users',
};

const Icons = {
  home: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  mapPin: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>
    </svg>
  ),
  users: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  cpu: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/>
    </svg>
  ),
  activity: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  alarm: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
    </svg>
  ),
  plus: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  edit: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
    </svg>
  ),
  chevronRight: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  unknown: (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
};

const IGNORED_PATHS = ['', 'ingresar', 'resetear', 'contacto', 'verestadoalarma', 'eliminar'];

const BreadcrumbAuto = ({ overrides = {} }) => {
  const location = useLocation();
  const params = useParams();
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [entityNames, setEntityNames] = useState({});
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);
  
  const paramsRef = useRef(params);
  const locationRef = useRef(location);
  const overridesRef = useRef(overrides);
  const loadedRef = useRef(false);
  
  paramsRef.current = params;
  locationRef.current = location;
  overridesRef.current = overrides;

  const { fetchLocationById, locations, selectedLocation } = useLocationsStore();
  const { fetchDataloggerById, selectedDatalogger, dataloggers } = useDataloggersStore();
  const { fetchChannelById, selectedChannel, channels } = useChannelsStore();
  const { fetchAlarmById, selectedAlarm } = useAlarmsStore();
  const { fetchUserById, selectedUser } = useUsersStore();
  const { user } = useAuthStore();
  
  const businessUuid = params.businessUuid;
  const dataloggerId = params.dataloggerId;
  const channelId = params.channelId;
  const alarmId = params.alarmId;
  const userId = params.userId || params.userUuid;
  const areMyAlarms = location.pathname.includes('/panel/alarmas/') ;
  
  const locationName = useMemo(() => {
    if (!businessUuid) return null;
    if (selectedLocation?.uuid === businessUuid) {
      return selectedLocation.name;
    }
    const loc = locations.find(l => l.uuid === businessUuid);
    return loc?.name || null;
  }, [businessUuid, locations, selectedLocation]);

  const dataloggerName = useMemo(() => {
    if (!dataloggerId) return null;
    if (selectedDatalogger?.uuid === dataloggerId) {
      return selectedDatalogger.name;
    }
    const dl = dataloggers.find(d => d.uuid === dataloggerId);
    return dl?.name || null;
  }, [dataloggerId, dataloggers, selectedDatalogger]);

  const channelName = useMemo(() => {
    if (!channelId) return null;
    if (selectedChannel?.uuid === channelId) {
      return selectedChannel.name;
    }
    const ch = channels.find(c => c.uuid === channelId);
    return ch?.name || null;
  }, [channelId, channels, selectedChannel]);

   const alarmName = useMemo(() => {
    if (!alarmId) return null;
    if (selectedAlarm?.uuid === alarmId) {      
      return selectedAlarm.name;
    }        
    
  }, [alarmId, selectedAlarm]);

  const userName = useMemo(() => {
    if (areMyAlarms && user) {   
      return user.first_name + ' ' + user.last_name;
    }
    if (userId && selectedUser?.uuid === userId) {            
      return selectedUser.first_name + ' ' + selectedUser.last_name;
    }    
    return null;
  }, [userId, selectedUser, areMyAlarms, user]);

  useEffect(() => {
    if (loadedRef.current) return;
    
    const loadEntities = async () => {
      if (businessUuid && !selectedLocation) {
        try {
          await fetchLocationById(businessUuid);
        } catch (e) {
          console.warn('Error loading location:', e);
        }
      }
      if (dataloggerId && businessUuid && !selectedDatalogger) {
        try {
          await fetchDataloggerById(dataloggerId, businessUuid);
        } catch (e) {
          console.warn('Error loading datalogger:', e);
        }
      }
      if (channelId && businessUuid && !selectedChannel) {
        try {
          await fetchChannelById(channelId, businessUuid);
        } catch (e) {
          console.warn('Error loading channel:', e);
        }
      }
      
      if (alarmId && businessUuid && !selectedAlarm) {
        try {
          await fetchAlarmById(businessUuid, alarmId);
        } catch (e) {
          console.warn('Error loading alarm:', e);
        }
      }
      if (userId && !selectedUser) {
        try {
          await fetchUserById(userId, businessUuid);
        } catch (e) {
          console.warn('Error loading user:', e);
        }
      }
/*
      if (areMyAlarms  ) {
        try {
          console.log('mis alarmas !!!');
          console.log('userUuid', userId);
          console.log('user', user);
          
         // await fetchUserById(userId, businessUuid);
        } catch (e) {
          console.warn('Error loading user for my alarms:', e);
        }
      }
      */
      loadedRef.current = true;
    };
    
    loadEntities();
  }, [businessUuid, dataloggerId, channelId, alarmId, userId, areMyAlarms]);

  useEffect(() => {
    const buildItems = () => {
      const pathname = locationRef.current.pathname;
      const currentOverrides = overridesRef.current;
      const { businessUuid: bu, dataloggerId: di, channelId: ci, alarmId: ai, userId: ui, userUuid } = paramsRef.current;
      const currentUserId = ui || userUuid;

      const items = [];
      const pathParts = pathname.split('/').filter(p => p);
      let currentPath = '';

      pathParts.forEach((part, index) => {
        if (IGNORED_PATHS.includes(part)) return;

        currentPath += `/${part}`;
        const isLast = index === pathParts.length - 1 || IGNORED_PATHS.includes(pathParts[index + 1]);

        let label = PATH_LABELS[part] || part;
        let icon = PATH_ICONS[part] || 'unknown';

        if (part === bu && locationName) {
          label = locationName;
          icon = 'mapPin';
        }

        if (part === di && dataloggerName) {
          label = dataloggerName;
          icon = 'cpu';
        }

        if (part === ci && channelName) {
          label = channelName;
          icon = 'activity';
        }

        if (part === ai && alarmName) {
          label =  alarmName;
          icon = 'alarm';
        }

        if (part === currentUserId && userName) {
          label = userName;
          icon = 'users';
        }

        if (currentOverrides[label]) {
          label = currentOverrides[label];
        }

        items.push({
          label,
          path: currentPath,
          icon,
          isLast
        });
      });

      return items;
    };

    setBreadcrumbs(buildItems());
  }, [location.pathname, businessUuid, locationName, dataloggerId, dataloggerName, channelId, channelName, alarmId, alarmName, userName]);

  //console.log('channeluuid', params.channelUuid);
  //console.log('selectedAlarm name', selectedAlarm?.name);
  //console.log('alarmName', alarmName);
  // console.log('areMyAlarms', areMyAlarms); 
  // console.log('userUuid', userId);
  
  

  const currentItem = breadcrumbs[breadcrumbs.length - 1];

  return (
    <div className={styles.breadcrumbContainer}>
      <nav className={styles.breadcrumb}>
        <Link to="/" className={styles.breadcrumbBtn}>
          {Icons.home}
          <span>Inicio</span>
        </Link>

        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            <span className={styles.separator}>{Icons.chevronRight}</span>
            <div className={item.isLast ? styles.breadcrumbItemCurrent : styles.breadcrumbItem}>
              {item.isLast ? (
                <span className={styles.breadcrumbBtn}>
                  {Icons[item.icon]}
                  <span>{item.label}</span>
                </span>
              ) : (
                <Link to={item.path} className={styles.breadcrumbBtn}>
                  {Icons[item.icon]}
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          </React.Fragment>
        ))}

        <button 
          className={styles.accordionToggle}
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          aria-label="Navegación"
        >
          {Icons.chevronRight}
          <span>Navegación</span>
        </button>
      </nav>

      <div className={`${styles.accordionContent} ${isAccordionOpen ? styles.open : ''}`}>
        <Link to="/" className={styles.accordionItem}>
          {Icons.home}
          <span>Inicio</span>
        </Link>
        {breadcrumbs.map((item, index) => (
          <React.Fragment key={index}>
            {item.isLast ? (
              <div className={styles.accordionItemCurrent}>
                {Icons[item.icon]}
                <span>{item.label}</span>
              </div>
            ) : (
              <Link to={item.path} className={styles.accordionItem}>
                {Icons[item.icon]}
                <span>{item.label}</span>
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BreadcrumbAuto;
