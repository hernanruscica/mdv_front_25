import { UnderConstruction, Home, Contact, Login, Dashboard, Users, Dataloggers, 
  Channels, ViewChannel, ViewUser, ActivateUser, Locations, ViewLocation, 
  ViewDatalogger, Alarms, ViewAlarm, CreatePage, SendActivationEmail, 
  ViewStateAlarm } from '../pages';

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/ingresar", element: <Login /> },
  { path: "/contacto", element: <Contact /> },
  { path: "/panel", element: <Dashboard />, private: true },
  
  // Locations routes
  { path: "/panel/ubicaciones", element: <Locations />, private: true },//Done
  { path: "/panel/ubicaciones/:businessUuid", element: <ViewLocation />, private: true },//Done
  { path: "/panel/ubicaciones/agregar", element: <CreatePage />, private: true },  //Done
  { path: "/panel/ubicaciones/:businessUuid/editar", element: <CreatePage />, private: true }, //Done
  { path: "/panel/ubicaciones/:businessUuid/eliminar", element: <UnderConstruction />, private: true }, //Done (put is_active === 0)
  
  // Users routes
  { path: "/panel/ubicaciones/:businessUuid/usuarios", element: <Users />, private: true },//Done
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId", element: <ViewUser />, private: true },//Done
  { path: "/panel/ubicaciones/:businessUuid/usuarios/activar/:token", element: <ActivateUser /> },
  { path: "/panel/ubicaciones/:businessUuid/usuarios/resetear", element: <SendActivationEmail /> },
  { path: "/panel/ubicaciones/:businessUuid/usuarios/agregar", element: <CreatePage />, private: true }, //Done
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/editar", element: <CreatePage />, private: true },  //Done
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/eliminar", element: <UnderConstruction />, private: true },//Done (put is_active === 0)

  // Dataloggers routes 
  { path: "/panel/ubicaciones/:businessUuid/dataloggers", element: <Dataloggers />, private: true },//Done
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:uuid", element: <ViewDatalogger />, private: true },//Done
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/agregar", element: <CreatePage />, private: true },//on progress
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/editar", element: <CreatePage />, private: true }, 
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/eliminar", element: <UnderConstruction />, private: true },

  // Channels routes
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales", element: <Channels />, private: true },//done
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId", element: <ViewChannel />, private: true },//done
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/editar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/eliminar", element: <UnderConstruction />, private: true },

  /* Alarms routes */
  // Alarmas routes / dataloggers
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/alarmas", element: <Alarms />, private: true },//done
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  // Alarmas routes / locations
  { path: "/panel/ubicaciones/:businessUuid/alarmas", element: <Alarms />, private: true }, //done
  { path: "/panel/ubicaciones/:businessUuid/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/alarmas/:alarmId/editar", element: <UnderConstruction />, private: true },
  // Alarmas routes / users
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/alarmas", element: <Alarms />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/usuarios/:userId/alarmas/:alarmId/editar", element: <UnderConstruction />, private: true },
  // Alarmas routes / channels
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas", element: <Alarms />, private: true },//done
  { path: "/panel/verestadoalarma/:token", element: <ViewStateAlarm />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas/agregar", element: <UnderConstruction />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/alarmas/agregar", element: <UnderConstruction />, private: true },
  { path: "/panel/ubicaciones/:businessUuid/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId/editar", element: <UnderConstruction />, private: true },  
  { path: "/panel/ubicaciones/:businessUuid/alarmas/:alarmId/eliminar", element: <UnderConstruction />, private: true },
];