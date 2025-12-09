import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { ordersApi } from '../services/ordersApi.js';
import '../styles/pages/orders.css';

function Orders() {
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await ordersApi.getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="orders">
        <Navbar />
        <div className="orders__loading">
          <div className="orders__loading-icon">⏳</div>
          <p className="orders__loading-text">Loading...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="orders">
        <Navbar />
        <div className="orders__error">
          <div className="orders__error-icon">🔒</div>
          <p className="orders__error-text">Please login to view orders</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="orders">
        <Navbar />
        <div className="orders__loading">
          <div className="orders__loading-icon">⏳</div>
          <p className="orders__loading-text">Loading your orders...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="orders">
      <Navbar />
      <div className="orders__container">
        <div className="orders__header">
          <h1 className="orders__title">My Orders</h1>
          <p className="orders__subtitle">
            {orders.length === 0 
              ? 'You haven\'t placed any orders yet' 
              : `You have ${orders.length} order${orders.length > 1 ? 's' : ''}`
            }
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="orders__empty">
            <div className="orders__empty-icon">📦</div>
            <h3 className="orders__empty-title">No Orders Yet</h3>
            <p className="orders__empty-text">Start shopping to see your orders here!</p>
            <Link to="/products" className="orders__empty-button">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="orders__list">
            {orders.map((order) => (
              <Link
                key={order._id}
                to={`/orders/${order._id}`}
                className="orders__card"
              >
                <div className="orders__card-header">
                  <div className="orders__card-info">
                    <div className="orders__card-number">
                      Order #{order._id.slice(-8).toUpperCase()}
                    </div>
                    <div className="orders__card-date">
                      <span>📅</span>
                      <span>{new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}</span>
                    </div>
                  </div>
                  <div className="orders__card-total-section">
                    <div>
                      <div className="orders__card-total-label">Total</div>
                      <div className="orders__card-total-amount">
                        ${order.totalPrice?.toFixed(2) || '0.00'}
                      </div>
                    </div>
                    <div className={`orders__card-status ${order.isDelivered ? 'orders__card-status--delivered' : 'orders__card-status--processing'}`}>
                      {order.isDelivered ? '✅ Delivered' : '⏳ Processing'}
                    </div>
                  </div>
                </div>

                <div className="orders__card-items">
                  <div className="orders__card-items-title">
                    <span>📦</span>
                    <span>Items ({order.orderItems?.length || 0})</span>
                  </div>
                  <div className="orders__card-items-list">
                    {order.orderItems?.slice(0, 3).map((item, itemIdx) => (
                      <div key={itemIdx} className="orders__card-item">
                        {item.product?.image && (
                          <img
                            src={item.product.image}
                            alt={item.product.name}
                            className="orders__card-item-image"
                          />
                        )}
                        <div className="orders__card-item-info">
                          <div className="orders__card-item-name">
                            {item.product?.name || 'Product'}
                          </div>
                          <div className="orders__card-item-details">
                            Quantity: {item.qty} × ${item.price?.toFixed(2) || '0.00'}
                          </div>
                        </div>
                        <div className="orders__card-item-price">
                          ${((item.qty || 0) * (item.price || 0)).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  {order.orderItems?.length > 3 && (
                    <div className="orders__card-more">
                      View All {order.orderItems.length} Items →
                    </div>
                  )}
                </div>

                {order.shippingAddress && (
                  <div className="orders__card-address">
                    <div className="orders__card-address-title">
                      <span>📍</span>
                      <span>Shipping Address</span>
                    </div>
                    <div className="orders__card-address-text">
                      {order.shippingAddress.address}, {order.shippingAddress.city}, {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default Orders;
