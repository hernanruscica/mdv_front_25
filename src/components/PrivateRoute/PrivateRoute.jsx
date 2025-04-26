import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export const PrivateRoute = ({ children }) => {
  const user = useAuthStore(state => state.user);
  const token = useAuthStore(state => state.token);

  if (!user || !token) {
    return <Navigate to="/ingresar" replace />;
  }

  return children;
};