import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import '../styles/components/private-route.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show nothing while checking auth (prevents flash of login page)
  if (loading) {
    return (
      <div className="private-route__loading">
        <div className="private-route__loading-content">
          <div className="private-route__loading-icon">⏳</div>
          <p className="private-route__loading-text">Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}
export default PrivateRoute;
