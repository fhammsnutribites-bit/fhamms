import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { usersApi } from '../../services/usersApi.js';

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
        <div style={{padding:40,textAlign:'center'}}>Access Denied</div>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <div style={{maxWidth:1200,margin:'30px auto',padding:20}}>
        <div style={{display:'flex', alignItems:'center', gap:'20px', marginBottom:'20px'}}>
          <button
            onClick={handleGoBack}
            style={{
              background: '#f8f9fa',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#666',
              cursor: 'pointer',
              transition: 'all 0.3s',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              e.target.style.background = '#e8f5e9';
              e.target.style.borderColor = '#4caf50';
              e.target.style.color = '#2e7d32';
            }}
            onMouseOut={(e) => {
              e.target.style.background = '#f8f9fa';
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.color = '#666';
            }}
          >
            ← Back
          </button>
          <h2 style={{margin: 0}}>Manage Users</h2>
        </div>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <table style={{width:'100%',borderCollapse:'collapse'}}>
            <thead>
              <tr style={{background:'#f5f5f5'}}>
                <th style={{padding:10,textAlign:'left'}}>Name</th>
                <th style={{padding:10,textAlign:'left'}}>Email</th>
                <th style={{padding:10,textAlign:'left'}}>Role</th>
                <th style={{padding:10,textAlign:'left'}}>Joined</th>
                <th style={{padding:10,textAlign:'left'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(usr => (
                <tr key={usr._id} style={{borderBottom:'1px solid #ddd'}}>
                  <td style={{padding:10}}>{usr.name}</td>
                  <td style={{padding:10}}>{usr.email}</td>
                  <td style={{padding:10}}>
                    {usr.isAdmin ? <span style={{color:'red'}}>Admin</span> : <span>User</span>}
                  </td>
                  <td style={{padding:10}}>{new Date(usr.createdAt).toLocaleDateString()}</td>
                  <td style={{padding:10}}>
                    {usr._id !== user.id && (
                      <button onClick={() => handleDelete(usr._id)} style={{padding:'5px 10px',background:'#dc3545',color:'white',border:'none',borderRadius:3,cursor:'pointer'}}>
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

