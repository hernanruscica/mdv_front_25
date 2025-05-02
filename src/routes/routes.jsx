import { UnderConstruction, Home, Contact, Login, Dashboard, Users, Dataloggers, 
  Channels, ViewChannel, ViewUser, ActivateUser, Locations, ViewLocation, 
  ViewDatalogger, Alarms, ViewAlarm, EditPage, CreatePage, SendActivationEmail, 
  ViewStateAlarm } from '../pages';

export const routes = [
  { path: "/", element: <Home /> },
  { path: "/ingresar", element: <Login /> },
  { path: "/contacto", element: <Contact /> },
  { path: "/panel", element: <Dashboard />, private: true },
  
  // Users routes
  { path: "/panel/usuarios", element: <Users />, private: true },
  { path: "/panel/usuarios/:id", element: <ViewUser />, private: true },
  { path: "/panel/usuarios/agregar", element: <CreatePage />, private: true },
  { path: "/panel/usuarios/activar/:token", element: <ActivateUser /> },
  { path: "/panel/usuarios/resetear", element: <SendActivationEmail /> },
  { path: "/panel/usuarios/:id/edicion", element: <EditPage />, private: true },

  // Locations routes
  { path: "/panel/ubicaciones", element: <Locations />, private: true },
  { path: "/panel/ubicaciones/:id", element: <ViewLocation />, private: true },
  { path: "/panel/ubicaciones/agregar", element: <CreatePage />, private: true },
  { path: "/panel/ubicaciones/:id/edicion", element: <EditPage />, private: true },

  // Dataloggers routes
  { path: "/panel/dataloggers", element: <Dataloggers />, private: true },
  { path: "/panel/dataloggers/:id", element: <ViewDatalogger />, private: true },
  { path: "/panel/dataloggers/agregar", element: <CreatePage />, private: true },
  { path: "/panel/dataloggers/:id/edicion", element: <EditPage />, private: true },

  // Channels routes
  { path: "/panel/dataloggers/:dataloggerId/canales", element: <Channels />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId", element: <ViewChannel />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/agregar", element: <CreatePage />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/edicion", element: <EditPage />, private: true },

  // Alarms routes
  // Alarmas routes / dataloggers
  { path: "/panel/dataloggers/:dataloggerId/alarmas", element: <Alarms />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  // Alarmas routes / locations
  { path: "/panel/ubicaciones/:locationId/alarmas", element: <Alarms />, private: true },
  { path: "/panel/ubicaciones/:locationId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  // Alarmas routes / users
  { path: "/panel/usuarios/:userId/alarmas", element: <Alarms />, private: true },
  { path: "/panel/usuarios/:userId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  // Alarmas routes / channels
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas", element: <Alarms />, private: true },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas/agregar", element: <CreatePage />, private: true },
  { path: "/panel/verestadoalarma/:token", element: <ViewStateAlarm /> },
  { path: "/panel/dataloggers/:dataloggerId/canales/:channelId/alarmas/:alarmId", element: <ViewAlarm />, private: true },
  { path: "/panel/dataloggers/:id/canales/:channelId/alarmas/:alarmId/edicion", element: <EditPage />, private: true },
];