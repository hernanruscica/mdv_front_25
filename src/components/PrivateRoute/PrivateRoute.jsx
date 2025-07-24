import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { jwtDecode } from 'jwt-decode';

export const PrivateRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  const path = location.pathname;

  // Chequeo proactivo de expiración (solo si es JWT)
  if (token) {
    try {
      const { exp } = jwtDecode(token);
      if (Date.now() >= exp * 1000) {
        // Token expirado, llamamos a la acción de logout
        logout();
        return <Navigate to="/ingresar" replace />;
      }
    } catch (e) {
      // Token corrupto, llamamos a la acción de logout
      logout();
      return <Navigate to="/ingresar" replace />;
    }
  }

  // Verificar autenticación básica
  if (!user || !token) {
    return <Navigate to="/ingresar" replace />;
  }

  // Verificar permisos de propietario para rutas de agregar
  if (path.endsWith('agregar') && (user?.espropietario !== 1 && user?.esadministrador !== true)) {
    return <Navigate to="/panel" replace />;
  }

  

  // Verifica permisos de administrador para rutas de edición
  if (path.endsWith('editar') && (user?.espropietario !== 1 && user?.esadministrador !== true)) {
    return <Navigate to="/panel" replace />;
  }

  //console.log('location.pathname', path.includes('ubicaciones'));

  return children;
};
