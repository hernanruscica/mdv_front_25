const titlePrefix = "Información de uso - Página ";

export const USER_VIEW_INFO = {
  Owner: {
    title: `${titlePrefix}"Ver usuario"`,
    paragraphs: [
      "Usted se encuentra en la página para ver más detalles del usuario seleccionado.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers."
    ],
    // Atributo opcional para las acciones
    actions: [
      "Visualizar alarmas vinculadas al usuario.",
      "Editar, archivar y/o eliminar al usuario actual.",
      "Asignar nuevos permisos en ubicaciones.",
      "Cambiar y/o eliminar permisos existentes en ubicaciones.",
    ]
  },
  General: {
    title: `${titlePrefix}"Ver usuario"`,
    paragraphs: [
      "Usted se encuentra en la página para ver más detalles del usuario seleccionado.",
      "Dependiendo de su rol, puede tener permisos limitados para ver o administrar ciertas secciones."
    ]
    // se puede dejar un array vacío
  }
};

export const USERS_LIST_INFO = {
  Owner: {
    title: `${titlePrefix}"Gestión de Usuarios"`,
    paragraphs: [
      "Usted se encuentra en la página para ver los usuarios de la ubicación actual.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Ver el listado de usuarios y sus datos de contacto.",
      "Acceder a los detalles de un usuario haciendo [CLICK] en su fila.",
      "Agregar nuevos usuarios a una ubicación.",
      "Visualizar a qué ubicaciones pertenece cada usuario.",
      "Gestionar usuarios archivados y sus permisos."
    ]
  },
  General: {
    title: `${titlePrefix}"Listado de Usuarios"`,
    paragraphs: [
      "Usted se encuentra en la página para ver los usuarios de esta ubicación.",
      "Dependiendo de su rol, puede tener permisos limitados para ver o administrar ciertas secciones."
    ]
  }
};

export const LOCATIONS_LIST_INFO = {
  Owner: {
    title: `${titlePrefix}"Gestión de Ubicaciones`,
    paragraphs: [
      "Como propietario, usted tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Agregar nuevas ubicaciones al sistema.",
      "Ver y buscar las ubicaciones existentes, activas y/o archivadas.",
      "Ver datos de cada una y los dataloggers vinculados a cada ubicación.",      
    ]
  },
  General: {
    title: `${titlePrefix}"Mis Ubicaciones"`,
    paragraphs: [
      "Aquí puede visualizar las ubicaciones a las que tiene acceso según sus permisos asignados.",
      "Dependiendo de su rol, puede tener permisos limitados para administrar ciertos sectores."
    ]
  }
};

export const LOCATION_VIEW_INFO = {
  Owner: {
    title: `${titlePrefix}"Detalles de la Ubicación"`,
    paragraphs: [
      "Como propietario, usted tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema.",
      "Una ubicación puede tener varios dataloggers y cada datalogger, varios canales y alarmas asociados."
    ],
    actions: [
      "Ver las alarmas activas de todos los equipos vinculados.[enlace]",
      "Ver los usuarios asociados a esta ubicación.[enlace]",
      "Ver los canales asociados a esta ubicación.[enlace]",
      "Editar los datos de la ubicación o archivarla/desarchivarla si es necesario.",
      "Agregar nuevos dataloggers a esta ubicación.",
      "Buscar y filtrar dataloggers (incluyendo archivados)."
    ]
  },
  General: {
    title: `${titlePrefix}"Detalles de la Ubicación"`,
    paragraphs: [
      "Usted se encuentra en la página de detalles de la ubicación seleccionada.",
      "Dependiendo de su rol, puede tener permisos limitados para ver o administrar los dataloggers, usuarios y alarmas de esta sección."
    ]
  }
};

export const DATALOGGERS_LIST_INFO = {
  Owner: {
    title: `${titlePrefix}"Ver Dataloggers"`, 
    paragraphs: [
      "Usted se encuentra en la página para ver todos los dataloggers de una ubicación.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Agregar nuevos dataloggers a la ubicación actual.",
      "Ver canales y alarmas asociados a cada equipo[Enlaces].",
      "Buscar equipos específicos por nombre o modelo.",
      "Ver u ocultar equipos archivados según sea necesario."
    ]
  },
  General: {
    title: `${titlePrefix}"Ver Dataloggers"`, 
    paragraphs: [
      "Usted se encuentra en la página de listado de dataloggers de la ubicación seleccionada.",
      "Dependiendo de su rol, puede tener permisos limitados para ver o administrar los equipos de esta sección."
    ]
  }
};

export const DATALOGGER_VIEW_INFO = {
  Owner: {
    title: `${titlePrefix}"Detalles del Datalogger"`, 
    paragraphs: [
      "Usted se encuentra en la página para ver más detalles del datalogger seleccionado.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Ver datos en tiempo real de las alarmas activas, mediante indicadores.",
      "Editar la configuración técnica.",
      "Archivar/desarchivar el datalogger",
      "Agregar nuevos canales de medición al equipo.",
      "Ver alarmas específicas por canal.",
      "Buscar y filtrar canales existentes, activos y/o archivados."
    ]
  },
  General: {
    title: `${titlePrefix}"Detalles del Datalogger"`,
    paragraphs: [
      "Usted se encuentra en la página de detalles del datalogger seleccionado.",
      "Dependiendo de su rol, puede tener permisos limitados para ver los datos en tiempo real o administrar la configuración del equipo."
    ]
  }
};

export const CHANNEL_VIEW_INFO = {
  Owner: {
    title: `${titlePrefix}"Detalles del Canal"`,
    paragraphs: [
      "Usted se encuentra en la página para ver más detalles del canal seleccionado.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Ver y/o editar la configuración técnica del canal.",
      "Archivar/desarchivar el canal",
      "Ver cuando se recibieron los ultimos datos del canal",
      "Ver las alarmas vinculadas a este canal (activas y archivadas).",
      "Ver y analizar el gráfico histórico de datos recibidos.",
      "Consultar el historial de alarmas disparadas.",      
    ]
  },
  General: {
    title: `${titlePrefix}"Detalles del Canal"`,
    paragraphs: [
      "Usted se encuentra en la página de detalles del canal seleccionado.",
      "Dependiendo de su rol, puede tener permisos limitados para ver los gráficos históricos o administrar las alarmas configuradas."
    ]
  }
};

export const CHANNELS_LIST_INFO = {
  Owner: {
    title: `${titlePrefix}"Ver canales"`, 
    paragraphs: [
      "Usted se encuentra en la página para ver todos los canales del datalogger actual.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Agregar nuevos canales al datalogger actual.",
      "Buscar y filtrar canales por nombre (Archivados o activos).",
      "Ver u ocultar equipos archivados según sea necesario.",
      "Ver alarmas asociadas a cada canal [Enlaces].",
      "Ver más detalles del canal [Enlaces].",
    ]
  },
  General: {
    title: `${titlePrefix}"Ver canales"`, 
    paragraphs: [
      "Usted se encuentra en la página de listado de dataloggers de la ubicación seleccionada.",
      "Dependiendo de su rol, puede tener permisos limitados para ver o administrar los equipos de esta sección."
    ]
  }
};

export const ALARMS_LIST_INFO = {
  Owner: {
    title: `${titlePrefix}"Gestión de Alarmas"`, 
    paragraphs: [
      "Usted se encuentra en la página para visualizar el listado de alarmas según el filtro seleccionado.",
      "Como propietario, tiene acceso completo para administrar todas las ubicaciones, usuarios y dataloggers en el sistema."
    ],
    actions: [
      "Ver el listado detallado de alarmas.",            
      "Buscar y/o filtrar alarmas (incluyendo las archivadas).",
      "Ver una alarma en detalle, haciendo [CLICK]"
    ]
  },
  General: {
    title: `${titlePrefix}"Listado de Alarmas"`,
    paragraphs: [
      "Usted se encuentra en la página para ver las alarmas configuradas.",
      "Dependiendo de su rol, puede tener permisos limitados para ver los detalles técnicos o administrar las alarmas de esta sección."
    ]
  }
};

export const ALARM_DETAILS_INFO = {
  Owner: {
    title: `${titlePrefix}"Detalle de Alarma"`,
    paragraphs: [
      "Usted se encuentra en la página de análisis detallado de una alarma específica.",
      "Como propietario, tiene acceso completo para gestionar los umbrales de disparo y las notificaciones."
    ],
    actions: [
      "Ver y editar la configuración de la alarma, por ejemplo la condición de disparo.",
      "Ver el último valor recibido.",
      "Archivar/desarchivar la alarma para todos los usuarios.",
      "Visualizar en el gráfico el momento exacto en que la alarma se disparó.",
      "Consultar el historial completo de disparos y reseteos.",
      "Ver y proporcionar soluciones (reportes) sobre cada evento disparado, haciendo [CLICK] sobre un registro de la tabla de HISTORIAL.",
      "Ver los usuarios reportados por el disparo, y si vieron o no la notificación, haciendo [CLICK] sobre un registro de la tabla de HISTORIAL.",
      
    ]
  },
  General: {
    title: `${titlePrefix}"Detalle de Alarma"`,
    paragraphs: [
      "Esta vista muestra el estado actual y el historial de una alarma específica.",
      "Dependiendo de su rol, puede visualizar el gráfico de comportamiento y el listado de eventos registrados."
    ]
  }
};

export const HOME_INFO = {
  Owner: {
    title: `${titlePrefix}"Panel de Inicio"`,
    paragraphs: [
      "Bienvenido al centro de mando de MDV Sensores.",
      "Como propietario, tiene una visión global y control total sobre todas las ubicaciones, dataloggers y usuarios registrados."
    ],
    actions: [
      "Administrar la infraestructura completa de monitoreo.",
      "Supervisar alarmas críticas en todas las ubicaciones.",
      "Gestionar altas de usuarios y asignación de roles.",
      "Acceder a reportes técnicos y de conectividad."
    ]
  },
  General: {
    title: `${titlePrefix}"Inicio"`,
    paragraphs: [
      "Usted se encuentra en la página de inicio de MDV Sensores, su portal de monitoreo.",
      "Desde aquí puede acceder a sus equipos asignados y supervisar los parámetros críticos asignados a su cuenta."
    ],
    actions: [
      "Ver estado de dataloggers en sus ubicaciones.",
      "Revisar y gestionar alarmas activas.",
      "Actualizar sus datos de contacto en su perfil.",
      "Contactar con soporte técnico."
    ]
  }
};

export const DASHBOARD_INFO = {
  Owner: {
    title: `${titlePrefix}"Panel de Control"`,
    paragraphs: [
      "Bienvenido al panel integral de MDV Sensores.",
      "Como propietario, usted tiene acceso global para administrar todas las ubicaciones, usuarios y equipos registrados en el sistema."
    ],
    actions: [
      "Supervisar el estado general de todas las ubicaciones.",
      "Administrar y dar de alta nuevos usuarios y roles.",
      "Configurar y monitorear dataloggers de manera centralizada.",
      "Acceder rápidamente a secciones críticas mediante los accesos directos."
    ]
  },
  General: {
    title: `${titlePrefix}"Panel de Control"`,
    paragraphs: [
      "Usted se encuentra en su panel de administración personal.",
      "Desde aquí puede supervisar el estado de sus equipos y administrar los recursos según los permisos asignados a su rol."
    ]
  }
};