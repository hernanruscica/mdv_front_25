import { Navigate, useLocation, useParams } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { jwtDecode } from 'jwt-decode';

export const PrivateRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const logout = useAuthStore(state => state.logout);
  const token = useAuthStore(state => state.token);
  const location = useLocation();
  const path = location.pathname;
  // const { token: tokenParams } = useLocation().params || {};
  const { token: tokenParams } = useParams();
  
  const userCurrentRole = 
      user?.businesses_roles.some(br => br.role === 'Owner')
        ? 'Owner'
        : user?.businesses_roles.find(br => br.uuid === businessUuid)?.role;

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
  if (path.endsWith('agregar') && (userCurrentRole === 'Owner' && userCurrentRole === 'Administrator')) {
    return <Navigate to="/panel" replace />;
  }  

  // Verifica permisos de administrador para rutas de edición
  if (path.endsWith('editar') && (userCurrentRole === 'Owner' && userCurrentRole === 'Administrator')) {
    return <Navigate to="/panel" replace />;
  }

  //Verifica permisos para la ruta '/panel/verestadoalarma/:token' si dentro del token hay un atributo 'userId' que sea igual al user.id avanza, sino vuelve al panel
  if (path.includes('verestadoalarma') && tokenParams) {
    try {
      const decodedToken = jwtDecode(tokenParams);
      console.log(decodedToken.userId, typeof decodedToken.userId, user.id, typeof user.id);
      if (decodedToken.userId !== user.id) {
        return <Navigate to="/panel" replace />;
      }
    } catch (e) {
      console.error('Error decoding token:', e);
      return <Navigate to="/panel" replace />;
    }
  }

  //console.log('location.pathname', path.includes('ubicaciones'));

  return children;
};
