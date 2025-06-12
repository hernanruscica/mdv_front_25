import { UnderConstruction, Home, Contact, Login, Dashboard, Users, Dataloggers, 
  Channels, ViewChannel, ViewUser, ActivateUser, Locations, ViewLocation, 
  ViewDatalogger, Alarms, ViewAlarm, CreatePage, SendActivationEmail, 
  ViewStateAlarm } from '../pages';

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/ingresar", element: <Login /> },
  { path: "/contacto", element: <Contact /> },
  { path: "/panel", element: <Dashboard />, private: true },
  
  // Users routes
  { path: "/panel/usuarios", element: <Users />, private: true },
  { path: "/panel/usuarios/:userId", element: <ViewUser />, private: true },
  { path: "/panel/usuarios/activar/:token", element: <ActivateUser /> },
  { path: "/panel/usuarios/resetear", element: <SendActivationEmail /> },
  { path: "/panel/usuarios/agregar", element: <CreatePage />, private: true },
  { path: "/panel/usuarios/:userId/editar", element: <CreatePage />, private: true },
  { path: "/panel/usuarios/:userId/archivar", element: <UnderConstruction />, private: true },
  { path: "/panel/usuarios/:userId/desarchivar", element: <UnderConstruction />, private: true },
  { path: "/panel/usuarios/:userId/eliminar", element: <UnderConstruction />, private: true },
  
  // Locations routes
  { path: "/panel/ubicaciones", element: <Locations />, private: true },
  { path: "/panel/ubicaciones/:id", element: <ViewLocation />, private: true },
  { path: "/panel/ubicaciones/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:locationId/editar", element: <CreatePage />, private: true },
   { path: "/panel/ubicaciones/:locationId/archivar", element: <UnderConstruction />, private: true },
  { path: "/panel/ubicaciones/:locationId/desarchivar", element: <UnderConstruction />, private: true },
  { path: "/panel/ubicaciones/:locationId/eliminar", element: <UnderConstruction />, private: true },

  // Dataloggers routes 
  { path: "/panel/dataloggers", element: <Dataloggers />, private: true },
  { path: "/panel/dataloggers/:id", element: <ViewDatalogger />, private: true },
  { path: "/panel/dataloggers/agregar", element: <CreatePage />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/editar", element: <CreatePage />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/archivar", element: <UnderConstruction />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/desarchivar", element: <UnderConstruction />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/eliminar", element: <UnderConstruction />, private: true },


  // Channels routes
  { path: "/panel/dataloggers/:dataloggerId/canales", element: <Channels />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId", element: <ViewChannel />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/agregar", element: <CreatePage />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/editar", element: <CreatePage />, private: true },

  /* Alarms routes */
  // Alarmas routes / dataloggers
  { path: "/panel/dataloggers/:dataloggerId/alarmas", element: <Alarms />, private: true },//FUNCIONA
  { path: "/panel/dataloggers/:dataloggerId/alarmas/:alarmId", element: <ViewAlarm />, private: true }, 
  // Alarmas routes / locations
  { path: "/panel/ubicaciones/:locationId/alarmas", element: <Alarms />, private: true },//FUNCIONA
  { path: "/panel/ubicaciones/:locationId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/ubicaciones/:locationId/alarmas/:alarmId/editar", element: <CreatePage />, private: true },
  // Alarmas routes / users
  { path: "/panel/usuarios/:userId/alarmas", element: <Alarms />, private: true },//FUNCIONA
  { path: "/panel/usuarios/:userId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/usuarios/:userId/alarmas/:alarmId/editar", element: <CreatePage />, private: true },
  // Alarmas routes / channels
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas", element: <Alarms />, private: true },//FUNCIONA
  { path: "/panel/verestadoalarma/:token", element: <ViewStateAlarm /> },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas/agregar", element: <CreatePage />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId/editar", element: <CreatePage />, private: true },
  { path: "/panel/alarmas/:alarmId/archivar", element: <UnderConstruction />, private: true },
  { path: "/panel/alarmas/:alarmId/desarchivar", element: <UnderConstruction />, private: true },
  { path: "/panel/alarmas/:alarmId/eliminar", element: <UnderConstruction />, private: true },
];