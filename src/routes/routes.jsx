import { UnderConstruction, Home, Contact, Login, Dashboard, Users, Dataloggers, 
  Channels, ViewChannel, CreateReport, ViewUser, ActivateUser, Locations, ViewLocation, 
  ViewDatalogger, Alarms, ViewAlarm, CreatePage, SendActivationEmail, 
  ViewStateAlarm, BackendLogs } from '../pages';

export const routes = [
  { path: "/", element: <Home /> },//sin breadcumb
  { path: "/ingresar", element: <Login /> },//sin breadcumb
  { path: "/resetear", element: <SendActivationEmail /> },//sin breadcumb
  { path: "/contacto", element: <Contact /> },//sin breadcumb
  { path: "/panel", element: <Dashboard />, private: true },//nuevo breadcrumb
  { path: "/panel/verestadoalarma/:token", element: <ViewStateAlarm /> },//sin breadcumb
  
  // Locations routes
  { path: "/panel/ubicaciones", element: <Locations />, private: true },//nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid", element: <ViewLocation />, private: true },//nuevo breadcrumb
  { path: "/panel/ubicaciones/agregar", element: <CreatePage />, private: true },  
  { path: "/panel/ubicaciones/:businessUuid/editar", element: <CreatePage />, private: true }, 
  { path: "/panel/ubicaciones/:businessUuid/eliminar", element: <UnderConstruction />, private: true },  //sin breadcumb
  
  // Users routes
  { path: "/panel/usuarios", element: <Users />, private: true },  //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/usuarios", element: <Users />, private: true },  //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId", element: <ViewUser />, private: true },  //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/usuarios/activar/:token", element: <ActivateUser /> }, //sin breadcumb
  { path: "/panel/usuarios/agregar", element: <CreatePage />, private: true }, 
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/editar", element: <CreatePage />, private: true },  
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/eliminar", element: <UnderConstruction />, private: true }, //sin breadcumb

  // Dataloggers routes 
  { path: "/panel/ubicaciones/:businessUuid/dataloggers", element: <Dataloggers />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId", element: <ViewDatalogger />, private: true }, //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/editar", element: <CreatePage />, private: true }, 
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/eliminar", element: <UnderConstruction />, private: true }, //sin breadcumb

  // Channels routes
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales", element: <Channels />, private: true }, //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId", element: <ViewChannel />, private: true },  //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/informe", element: <CreateReport />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/editar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/eliminar", element: <UnderConstruction />, private: true }, //sin breadcumb

  /* Alarms routes */
  // Alarmas routes / dataloggers
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/alarmas", element: <Alarms />, private: true },  //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/alarmas/:alarmId", element: <ViewAlarm />, private: true },//nuevo breadcrumb
  // Alarmas routes / locations
  { path: "/panel/ubicaciones/:businessUuid/alarmas", element: <Alarms />, private: true }, 
  { path: "/panel/ubicaciones/:businessUuid/alarmas/:alarmId", element: <ViewAlarm />, private: true },//nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/alarmas/:alarmId/editar", element: <CreatePage />, private: true },
  // Alarmas routes / users
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/alarmas", element: <Alarms />, private: true }, 
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/alarmas/:alarmId", element: <ViewAlarm />, private: true }, //nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/alarmas/:alarmId/editar", element: <CreatePage />, private: true },
  // Alarmas routes / channels
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas", element: <Alarms />, private: true },
  
  
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId", element: <ViewAlarm />, private: true },//nuevo breadcrumb
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/alarmas/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId/editar", element: <CreatePage />, private: true },  
  { path: "/panel/ubicaciones/:businessUuid/alarmas/:alarmId/eliminar", element: <ViewAlarm />, private: true },//nuevo breadcrumb

  // Alarmas routes / userUuid (sin businessUuid)
  { path: "/panel/alarmas/:userUuid", element: <Alarms />, private: true },

  // Backend logs route
  { path: "/panel/historial", element: <BackendLogs />, private: true },
];