import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { jwtDecode } from 'jwt-decode';

export const PrivateRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  const path = location.pathname;

  // Chequeo proactivo de expiración (solo si es JWT)
  if (token) {
    try {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        // Token expirado
        useAuthStore.getState().logout(); // O la función que limpias el store
        return <Navigate to="/ingresar" replace />;
      }
    } catch (e) {
      // Token corrupto
      useAuthStore.getState().logout();
      return <Navigate to="/ingresar" replace />;
    }
  }

  // Verificar autenticación básica
  if (!user || !token) {
    return <Navigate to="/ingresar" replace />;
  }

  // Verificar permisos de propietario para rutas de agregar y editar
  if ((path.endsWith('agregar') || path.endsWith('editar')) && user?.espropietario !== 1) {
    return <Navigate to="/panel" replace />;
  }

  return children;
};