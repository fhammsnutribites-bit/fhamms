import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { usersApi } from '../../services/usersApi.js';
import '../../styles/pages/admin-users.css';

function AdminUsers() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const handleGoBack = () => {
    navigate(-1);
  };

  const fetchUsers = useCallback(async () => {
    if (!user?.isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await usersApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = useCallback(async (userId) => {
    if (userId === user.id) {
      alert('Cannot delete your own account');
      return;
    }
    if (!confirm('Delete this user?')) return;
    try {
      await usersApi.delete(userId);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
      console.error('Delete user error:', err);
    }
  }, [user, fetchUsers]);

  if (!user?.isAdmin) {
    return (
      <div>
        <Navbar />
        <div className="admin-users__denied">Access Denied</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div className="admin-users__container">
        <div className="admin-users__header">
          <button className="admin-users__back-btn" onClick={handleGoBack}>
           ← Back
          </button>
          <h2 className="admin-users__title">Manage Users</h2>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table className="admin-users__table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(usr => (
                <tr key={usr._id}>
                  <td>{usr.name}</td>
                  <td>{usr.email}</td>
                  <td>
                    {usr.isAdmin ? <span className="admin-users__admin">Admin</span> : <span>User</span>}
                  </td>
                  <td>{new Date(usr.createdAt).toLocaleDateString()}</td>
                  <td>
                    {usr._id !== user.id && (
                      <button className="admin-users__delete-btn" onClick={() => handleDelete(usr._id)}>
                        Delete
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
export default AdminUsers;

