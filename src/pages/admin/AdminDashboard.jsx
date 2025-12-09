import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { productsApi } from '../../services/productsApi.js';
import { ordersApi } from '../../services/ordersApi.js';
import { usersApi } from '../../services/usersApi.js';
import '../../styles/pages/admin-dashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  const [recentOrders, setRecentOrders] = useState([]);

  const fetchData = useCallback(async () => {
    if (!user?.isAdmin) return;
    try {
      const [productsData, ordersData, usersData] = await Promise.all([
        productsApi.getAll(),
        ordersApi.getAll(),
        usersApi.getAll()
      ]);
      setStats({
        products: productsData.length,
        orders: ordersData.length,
        users: usersData.length
      });
      setRecentOrders(ordersData.slice(0, 5));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!user?.isAdmin) {
    return (
      <div className="admin-dashboard">
        <Navbar />
        <div className="admin-dashboard__access-denied">Access Denied</div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <Navbar />
      <div className="admin-dashboard__container">
        <h2 className="admin-dashboard__title">Admin Dashboard</h2>
        <div className="admin-dashboard__actions">
          <Link to="/admin/products" className="admin-dashboard__action-link admin-dashboard__action-link--products">
            Manage Products
          </Link>
          <Link to="/admin/orders" className="admin-dashboard__action-link admin-dashboard__action-link--orders">
            Manage Orders
          </Link>
          <Link to="/admin/users" className="admin-dashboard__action-link admin-dashboard__action-link--users">
            Manage Users
          </Link>
          <Link to="/admin/promo-codes" className="admin-dashboard__action-link admin-dashboard__action-link--promo-codes">
            Manage Promo Codes
          </Link>
          <Link to="/admin/delivery-charges" className="admin-dashboard__action-link admin-dashboard__action-link--delivery-charges">
            Manage Delivery Charges
          </Link>
        </div>
        <div className="admin-dashboard__stats">
          <div className="admin-dashboard__stat-card">
            <h3 className="admin-dashboard__stat-title">Total Products</h3>
            <p className="admin-dashboard__stat-value">{stats.products}</p>
          </div>
          <div className="admin-dashboard__stat-card">
            <h3 className="admin-dashboard__stat-title">Total Orders</h3>
            <p className="admin-dashboard__stat-value">{stats.orders}</p>
          </div>
          <div className="admin-dashboard__stat-card">
            <h3 className="admin-dashboard__stat-title">Total Users</h3>
            <p className="admin-dashboard__stat-value">{stats.users}</p>
          </div>
        </div>
        <div className="admin-dashboard__orders-section">
          <h3 className="admin-dashboard__orders-title">Recent Orders</h3>
          {recentOrders.length === 0 ? (
            <p className="admin-dashboard__orders-empty">No orders yet</p>
          ) : (
            <table className="admin-dashboard__table">
              <thead className="admin-dashboard__table-header">
                <tr>
                  <th className="admin-dashboard__table-header-cell">Order ID</th>
                  <th className="admin-dashboard__table-header-cell">User</th>
                  <th className="admin-dashboard__table-header-cell">Total</th>
                  <th className="admin-dashboard__table-header-cell">Status</th>
                  <th className="admin-dashboard__table-header-cell">Date</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(order => (
                  <tr key={order._id} className="admin-dashboard__table-row">
                    <td className="admin-dashboard__table-cell">{order._id.substring(0, 8)}...</td>
                    <td className="admin-dashboard__table-cell">{order.user?.name || 'N/A'}</td>
                    <td className="admin-dashboard__table-cell">₹{order.totalPrice}</td>
                    <td className="admin-dashboard__table-cell">
                      <span className={`admin-dashboard__status ${order.isDelivered ? 'admin-dashboard__status--delivered' : 'admin-dashboard__status--processing'}`}>
                        {order.isDelivered ? 'Delivered' : 'Processing'}
                      </span>
                    </td>
                    <td className="admin-dashboard__table-cell">{new Date(order.createdAt).toLocaleDateString()}</td>
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
