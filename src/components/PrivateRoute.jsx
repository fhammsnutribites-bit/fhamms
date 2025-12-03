import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  // Show nothing while checking auth (prevents flash of login page)
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        background: '#f8f9fa'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '18px', color: '#666' }}>Loading...</p>
        </div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}
export default PrivateRoute;
