import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { API_URL } from '../../config/api.js';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    async function fetchData() {
      if (!user?.isAdmin) return;
      try {
        const token = localStorage.getItem('token');
        const [productsRes, ordersRes, usersRes] = await Promise.all([
          axios.get(`${API_URL}/api/products`),
          axios.get(`${API_URL}/api/orders`, {
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/api/users`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);
        setStats({
          products: productsRes.data.length,
          orders: ordersRes.data.length,
          users: usersRes.data.length
        });
        setRecentOrders(ordersRes.data.slice(0, 5));
      } catch (err) {
        console.error('Failed to load dashboard data');
      }
    }
    fetchData();
  }, [user]);

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
      <div style={{padding:40}}>
        <h2>Admin Dashboard</h2>
        <div style={{display:'flex',gap:20,marginBottom:30}}>
          <Link to="/admin/products" style={{padding:'10px 20px',background:'#007bff',color:'white',textDecoration:'none',borderRadius:5}}>
            Manage Products
          </Link>
          <Link to="/admin/orders" style={{padding:'10px 20px',background:'#28a745',color:'white',textDecoration:'none',borderRadius:5}}>
            Manage Orders
          </Link>
          <Link to="/admin/users" style={{padding:'10px 20px',background:'#dc3545',color:'white',textDecoration:'none',borderRadius:5}}>
            Manage Users
          </Link>
        </div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:20,marginBottom:30}}>
          <div style={{padding:20,border:'1px solid #ddd',borderRadius:8}}>
            <h3>Total Products</h3>
            <p style={{fontSize:32,fontWeight:'bold'}}>{stats.products}</p>
          </div>
          <div style={{padding:20,border:'1px solid #ddd',borderRadius:8}}>
            <h3>Total Orders</h3>
            <p style={{fontSize:32,fontWeight:'bold'}}>{stats.orders}</p>
          </div>
          <div style={{padding:20,border:'1px solid #ddd',borderRadius:8}}>
            <h3>Total Users</h3>
            <p style={{fontSize:32,fontWeight:'bold'}}>{stats.users}</p>
          </div>
        </div>
        <div>
          <h3>Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p>No orders yet</p>
          ) : (
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f5f5f5'}}>
                  <th style={{padding:10,textAlign:'left'}}>Order ID</th>
                  <th style={{padding:10,textAlign:'left'}}>User</th>
                  <th style={{padding:10,textAlign:'left'}}>Total</th>
                  <th style={{padding:10,textAlign:'left'}}>Status</th>
                  <th style={{padding:10,textAlign:'left'}}>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} style={{borderBottom:'1px solid #ddd'}}>
                    <td style={{padding:10}}>{order._id.substring(0, 8)}...</td>
                    <td style={{padding:10}}>{order.user?.name || 'N/A'}</td>
                    <td style={{padding:10}}>${order.totalPrice}</td>
                    <td style={{padding:10}}>
                      {order.isDelivered ? <span style={{color:'green'}}>Delivered</span> : <span style={{color:'orange'}}>Processing</span>}
                    </td>
                    <td style={{padding:10}}>{new Date(order.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
