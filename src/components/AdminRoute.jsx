import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Loader from './Loader.jsx';

function AdminRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div>
        <Loader size="large" text="Verifying admin access..." fullPage={true} />
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" />;
  }

  // Redirect to home if not admin
  if (!user.isAdmin) {
    return <Navigate to="/" />;
  }

  return children;
}
export default AdminRoute;


