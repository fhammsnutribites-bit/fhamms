import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Navbar from '../../components/Navbar.jsx';
import { ordersApi } from '../../services/ordersApi.js';
import { formatOrderNumber, formatOrderDate, getOrderStatus, getDeliveryStatusOptions } from '../../utils/orderUtils.js';
import '../../styles/pages/admin-orders.css';

function AdminOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date-desc');

  const handleGoBack = () => {
    navigate(-1);
  };

  const fetchOrders = useCallback(async () => {
    if (!user?.isAdmin) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const data = await ordersApi.getAll();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleDeliveryStatusUpdate = useCallback(async (orderId, deliveryStatus) => {
    try {
      await ordersApi.updateDeliveryStatus(orderId, deliveryStatus);
      fetchOrders(); // Refresh orders after status update
    } catch (err) {
      alert('Failed to update delivery status');
      console.error('Delivery status update error:', err);
    }
  }, [fetchOrders]);

  const handleDeleteOrder = useCallback(async (orderId) => {
    if (!window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      return;
    }

    try {
      await ordersApi.delete(orderId);
      fetchOrders(); // Refresh orders after deletion
      alert('Order deleted successfully');
    } catch (err) {
      alert('Failed to delete order');
      console.error('Order deletion error:', err);
    }
  }, [fetchOrders]);

  const handleTrackingIdUpdate = useCallback(async (orderId, trackingId) => {
    try {
      await ordersApi.updateTrackingId(orderId, trackingId);
      fetchOrders(); // Refresh orders after tracking ID update
    } catch (err) {
      alert('Failed to update tracking ID');
      console.error('Tracking ID update error:', err);
    }
  }, [fetchOrders]);

  // Backward compatibility
  const handleDeliver = useCallback(async (orderId) => {
    await handleDeliveryStatusUpdate(orderId, 'delivered');
  }, [handleDeliveryStatusUpdate]);

  // Filter and sort orders
  const filteredAndSortedOrders = useMemo(() => {
    let filtered = [...orders];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order =>
        order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shippingAddress?.city?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => {
        switch (statusFilter) {
          case 'pending':
            return order.paymentStatus === 'pending';
          case 'paid':
            return order.paymentStatus === 'success' && !order.isDelivered;
          case 'delivered':
            return order.isDelivered;
          case 'failed':
            return order.paymentStatus === 'failed';
          default:
            return true;
        }
      });
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'date-asc':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'total-desc':
          return b.totalPrice - a.totalPrice;
        case 'total-asc':
          return a.totalPrice - b.totalPrice;
        default:
          return 0;
      }
    });

    return filtered;
  }, [orders, searchTerm, statusFilter, sortBy]);


  // Calculate statistics
  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter(o => o.paymentStatus === 'pending').length;
    const delivered = orders.filter(o => o.isDelivered).length;

    return { total, pending, delivered };
  }, [orders]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    // Search is already handled by useMemo
  };

  if (!user?.isAdmin) {
    return (
      <div className="admin-orders">
        <Navbar />
        <div className="admin-orders__container">
          <div className="admin-orders__empty">
            <div className="admin-orders__empty-icon">🚫</div>
            <h3 className="admin-orders__empty-title">Access Denied</h3>
            <p className="admin-orders__empty-text">You don't have permission to access this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <Navbar />
      <div className="admin-orders__container">
        {/* Header */}
        <div className="admin-orders__header">
          <div className="admin-orders__header-left">
            <button className="admin-orders__back-btn" onClick={handleGoBack}>
              ← Back
            </button>
            <h1 className="admin-orders__title">Manage Orders</h1>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="admin-orders__stats">
          <div className="admin-orders__stat-card">
            <div className="admin-orders__stat-icon admin-orders__stat-icon--total">
              📦
            </div>
            <div className="admin-orders__stat-content">
              <h3>{stats.total}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="admin-orders__stat-card">
            <div className="admin-orders__stat-icon admin-orders__stat-icon--pending">
              ⏳
            </div>
            <div className="admin-orders__stat-content">
              <h3>{stats.pending}</h3>
              <p>Pending Orders</p>
            </div>
          </div>
          <div className="admin-orders__stat-card">
            <div className="admin-orders__stat-icon admin-orders__stat-icon--delivered">
              ✅
            </div>
            <div className="admin-orders__stat-content">
              <h3>{stats.delivered}</h3>
              <p>Delivered Orders</p>
            </div>
          </div>
        </div>

        {/* Search and Filter Section */}
        <div className="admin-orders__search-section">
          <form onSubmit={handleSearch} className="admin-orders__search-row">
            <input
              type="text"
              placeholder="Search by order ID, customer name, email, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="admin-orders__search-input"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="admin-orders__filter-select"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="delivered">Delivered</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="admin-orders__filter-select"
            >
              <option value="date-desc">Newest First</option>
              <option value="date-asc">Oldest First</option>
              <option value="total-desc">Highest Amount</option>
              <option value="total-asc">Lowest Amount</option>
            </select>
            <button type="submit" className="admin-orders__search-btn">
              Search
            </button>
          </form>
        </div>


        {/* All Orders Section */}
        <div className="admin-orders__recent-section">
          <h2 className="admin-orders__section-title">
            📋 Orders {filteredAndSortedOrders.length !== orders.length && `(${filteredAndSortedOrders.length} of ${orders.length})`}
          </h2>

          {loading ? (
            <div className="admin-orders__loading">
              <div className="admin-orders__loading-text">Loading orders...</div>
            </div>
          ) : filteredAndSortedOrders.length === 0 ? (
            <div className="admin-orders__empty">
              <div className="admin-orders__empty-icon">📦</div>
              <h3 className="admin-orders__empty-title">
                {orders.length === 0 ? 'No Orders Yet' : 'No Orders Match Your Search'}
              </h3>
              <p className="admin-orders__empty-text">
                {orders.length === 0
                  ? 'Orders will appear here once customers place them.'
                  : 'Try adjusting your search criteria or filters.'
                }
              </p>
            </div>
          ) : (
            <div className="admin-orders__orders-grid">
              {filteredAndSortedOrders.map(order => (
                <OrderCard key={order._id} order={order} onDeliveryStatusUpdate={handleDeliveryStatusUpdate} onTrackingIdUpdate={handleTrackingIdUpdate} onDeleteOrder={handleDeleteOrder} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Order Card Component
function OrderCard({ order, onDeliveryStatusUpdate, onTrackingIdUpdate, onDeleteOrder, isCompact = false }) {
  console.log('OrderCard rendered for order:', order._id, 'onDeleteOrder:', !!onDeleteOrder);
  const status = getOrderStatus(order.paymentStatus, order.isDelivered, order.deliveryStatus);
  const deliveryOptions = getDeliveryStatusOptions();
  const [trackingIdInput, setTrackingIdInput] = useState(order.trackingId || '');
  const [isEditingTracking, setIsEditingTracking] = useState(false);

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    onDeliveryStatusUpdate(order._id, newStatus);
  };

  const handleTrackingIdSubmit = () => {
    if (trackingIdInput.trim()) {
      onTrackingIdUpdate(order._id, trackingIdInput.trim());
      setIsEditingTracking(false);
    }
  };

  const canEditTracking = ['shipped', 'out_for_delivery', 'delivered'].includes(order.deliveryStatus);

  return (
    <div className="admin-orders__order-card">
      <div className="admin-orders__order-header">
        <div>
          <div className="admin-orders__order-number">
            {formatOrderNumber(order._id)}
          </div>
          <div className={`admin-orders__order-status admin-orders__order-status--${status.text.toLowerCase().replace(' ', '-')}`}>
            {status.text}
          </div>
        </div>
        <div className="admin-orders__order-date">
          {formatOrderDate(order.createdAt, 'short')}
        </div>
      </div>

      <div className="admin-orders__customer-info">
        <div className="admin-orders__customer-name">
          {order.user?.name || 'Unknown Customer'}
        </div>
        <div className="admin-orders__customer-email">
          {order.user?.email || 'No email'}
        </div>
      </div>

      {!isCompact && (
        <>
          <div className="admin-orders__order-items">
            <div className="admin-orders__order-items-title">Order Items</div>
            {order.orderItems?.map((item, idx) => (
              <div key={idx} className="admin-orders__item">
                <div className="admin-orders__item-name">
                  {item.product?.name || 'Product'}
                </div>
                <div className="admin-orders__item-qty">×{item.qty}</div>
                <div className="admin-orders__item-price">
                  ₹{(item.price || 0).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          <div className="admin-orders__order-total">
            <div className="admin-orders__total-label">Total Amount</div>
            <div className="admin-orders__total-amount">
              ₹{(order.totalPrice || 0).toFixed(2)}
            </div>
          </div>
        </>
      )}

      <div className="admin-orders__order-actions">
        <div className="admin-orders__status-update">
          <label className="admin-orders__status-label">Delivery Status:</label>
          <select
            value={order.deliveryStatus || 'pending'}
            onChange={handleStatusChange}
            className="admin-orders__status-select"
          >
            {deliveryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {canEditTracking && (
          <div className="admin-orders__tracking-section">
            <label className="admin-orders__tracking-label">Tracking ID:</label>
            {order.trackingId && !isEditingTracking ? (
              <div className="admin-orders__tracking-display">
                <span className="admin-orders__tracking-id">{order.trackingId}</span>
                <button
                  onClick={() => setIsEditingTracking(true)}
                  className="admin-orders__tracking-edit-btn"
                >
                  ✏️
                </button>
              </div>
            ) : (
              <div className="admin-orders__tracking-input-group">
                <input
                  type="text"
                  value={trackingIdInput}
                  onChange={(e) => setTrackingIdInput(e.target.value)}
                  placeholder="Enter tracking ID"
                  className="admin-orders__tracking-input"
                  onKeyPress={(e) => e.key === 'Enter' && handleTrackingIdSubmit()}
                />
                <button
                  onClick={handleTrackingIdSubmit}
                  disabled={!trackingIdInput.trim()}
                  className="admin-orders__tracking-save-btn"
                >
                  💾
                </button>
                {order.trackingId && (
                  <button
                    onClick={() => {
                      setIsEditingTracking(false);
                      setTrackingIdInput(order.trackingId);
                    }}
                    className="admin-orders__tracking-cancel-btn"
                  >
                    ❌
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {order.deliveryStatus === 'delivered' && order.deliveredAt && (
          <div className="admin-orders__delivered-info">
            Delivered on {new Date(order.deliveredAt).toLocaleDateString()}
          </div>
        )}

        {/* Delete Order Button - Admin Only */}
        <div className="admin-orders__actions" style={{ border: '2px solid red', padding: '10px', margin: '10px' }}>
          <button
            onClick={() => {
              console.log('Delete button clicked for order:', order._id);
              onDeleteOrder(order._id);
            }}
            className="admin-orders__delete-btn"
            title="Delete Order"
            style={{ background: 'red', color: 'white', padding: '10px', border: 'none', borderRadius: '5px' }}
          >
            🗑️ DELETE ORDER (TEST)
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminOrders;

