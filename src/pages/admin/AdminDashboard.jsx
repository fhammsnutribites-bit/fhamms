import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { productsApi } from '../../services/productsApi.js';
import { ordersApi } from '../../services/ordersApi.js';
import { usersApi } from '../../services/usersApi.js';
import { formatOrderNumber, formatOrderDate } from '../../utils/orderUtils.js';
import '../../styles/pages/admin-dashboard.css';

function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0 });
  const [allOrders, setAllOrders] = useState([]);
  const [recentOrdersSearch, setRecentOrdersSearch] = useState('');
  const [recentOrdersStatus, setRecentOrdersStatus] = useState('all');

  const handleGoBack = () => {
    navigate(-1);
  };

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
      setAllOrders(ordersData);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    }
  }, [user]);

  // Filter and get recent orders based on search and status
  const filteredRecentOrders = useMemo(() => {
    let filtered = [...allOrders];

    // Get recent orders (last 10 days)
    const tenDaysAgo = new Date();
    tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);

    filtered = filtered.filter(order => new Date(order.createdAt) >= tenDaysAgo);

    // Apply search filter
    if (recentOrdersSearch) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(recentOrdersSearch.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(recentOrdersSearch.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(recentOrdersSearch.toLowerCase())
      );
    }

    // Apply status filter
    if (recentOrdersStatus !== 'all') {
      filtered = filtered.filter(order => {
        switch (recentOrdersStatus) {
          case 'pending':
            return order.paymentStatus === 'pending' || order.paymentStatus === 'failed';
          case 'paid':
            return order.paymentStatus === 'success' && !order.isDelivered;
          case 'delivered':
            return order.isDelivered;
          default:
            return true;
        }
      });
    }

    // Sort by newest first
    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 10);
  }, [allOrders, recentOrdersSearch, recentOrdersStatus]);

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
        <div className="admin-dashboard__header">
          
          <h2 className="admin-dashboard__title">Admin Dashboard</h2>
        </div>
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
          <Link to="/admin/categories" className="admin-dashboard__action-link admin-dashboard__action-link--categories">
            Manage Categories
          </Link>
          <Link to="/admin/delivery-charges" className="admin-dashboard__action-link admin-dashboard__action-link--delivery-charges">
            Manage Delivery Charges
          </Link>
          <Link to="/admin/notifications" className="admin-dashboard__action-link admin-dashboard__action-link--notifications">
            Manage Notifications
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
          <div className="admin-dashboard__orders-header">
            <h3 className="admin-dashboard__orders-title">Recent Orders</h3>
            <div className="admin-dashboard__orders-filters">
              <input
                type="text"
                placeholder="Search orders..."
                value={recentOrdersSearch}
                onChange={(e) => setRecentOrdersSearch(e.target.value)}
                className="admin-dashboard__search-input"
              />
              <select
                value={recentOrdersStatus}
                onChange={(e) => setRecentOrdersStatus(e.target.value)}
                className="admin-dashboard__status-filter"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>
          </div>

          {filteredRecentOrders.length === 0 ? (
            <p className="admin-dashboard__orders-empty">
              {allOrders.length === 0 ? 'No orders yet' : 'No orders match your search'}
            </p>
          ) : (
            <div className="admin-dashboard__orders-table-container">
              <table className="admin-dashboard__table">
                <thead className="admin-dashboard__table-header">
                  <tr>
                    <th className="admin-dashboard__table-header-cell">Order Number</th>
                    <th className="admin-dashboard__table-header-cell">Customer</th>
                    <th className="admin-dashboard__table-header-cell">Items</th>
                    <th className="admin-dashboard__table-header-cell">Total</th>
                    <th className="admin-dashboard__table-header-cell">Status</th>
                    <th className="admin-dashboard__table-header-cell">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecentOrders.map(order => (
                    <tr key={order._id} className="admin-dashboard__table-row">
                      <td className="admin-dashboard__table-cell admin-dashboard__order-number">
                        {formatOrderNumber(order._id)}
                      </td>
                      <td className="admin-dashboard__table-cell">
                        <div className="admin-dashboard__customer-info">
                          <div className="admin-dashboard__customer-name">{order.user?.name || 'N/A'}</div>
                          <div className="admin-dashboard__customer-email">{order.user?.email || ''}</div>
                        </div>
                      </td>
                      <td className="admin-dashboard__table-cell">
                        {order.orderItems?.length || 0} item{order.orderItems?.length !== 1 ? 's' : ''}
                      </td>
                      <td className="admin-dashboard__table-cell admin-dashboard__total-amount">
                        ₹{order.totalPrice?.toFixed(2) || '0.00'}
                      </td>
                      <td className="admin-dashboard__table-cell">
                        <span className={`admin-dashboard__status ${
                          order.isDelivered
                            ? 'admin-dashboard__status--delivered'
                            : order.paymentStatus === 'success'
                              ? 'admin-dashboard__status--paid'
                              : order.paymentStatus === 'failed'
                                ? 'admin-dashboard__status--failed'
                                : 'admin-dashboard__status--pending'
                        }`}>
                          {order.isDelivered ? 'Delivered' :
                           order.paymentStatus === 'success' ? 'Paid' :
                           order.paymentStatus === 'failed' ? 'Failed' : 'Pending'}
                        </span>
                      </td>
                      <td className="admin-dashboard__table-cell">
                        {formatOrderDate(order.createdAt, 'short')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="admin-dashboard__view-all">
            <Link to="/admin/orders" className="admin-dashboard__view-all-link">
              View All Orders →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminDashboard;
