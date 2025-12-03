import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { API_URL } from '../../config/api.js';

function AdminUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    if (!user?.isAdmin) return;
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${API_URL}/api/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users');
    }
    setLoading(false);
  }

  const handleDelete = async userId => {
    if (userId === user.id) {
      alert('Cannot delete your own account');
      return;
    }
    if (!confirm('Delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(
        `${API_URL}/api/users/${userId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

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
        <h2>Manage Users</h2>
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

