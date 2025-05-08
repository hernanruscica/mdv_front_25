import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const PrivateRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  const path = location.pathname;

  // Verificar autenticación básica
  if (!user || !token) {
    return <Navigate to="/ingresar" replace />;
  }

  // Verificar permisos de propietario para rutas de agregar y editar
  if ((path.endsWith('agregar') || path.endsWith('editar')) && user.espropietario !== 1) {
    return <Navigate to="/panel" replace />;
  }

  return children;
};