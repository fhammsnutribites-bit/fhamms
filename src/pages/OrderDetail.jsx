import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import { ordersApi } from '../services/ordersApi.js';
import { reviewsApi } from '../services/reviewsApi.js';
import RatingDisplay from '../components/RatingDisplay.jsx';
import { getOrderStatus, getDeliveryStatusOptions } from '../utils/orderUtils.js';
import { formatOrderNumber } from '../utils/orderUtils.js';
import '../styles/pages/OrderDetail.css';

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  
  // Consolidated state management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});
  const [reviewErrors, setReviewErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusUpdateNotification, setStatusUpdateNotification] = useState(false);

  // Refs for tracking
  const reviewsFetchedRef = useRef(new Set());
  const autoRefreshRef = useRef(null);
  const handlersRef = useRef(new Map());
  const submitReviewRef = useRef(null);
  const notificationTimeoutRef = useRef(null);

  // Fetch order - optimized with single function
  const fetchOrder = useCallback(async (isRefresh = false) => {
    if (authLoading || !user) {
      if (!isRefresh) setLoading(false);
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const data = await ordersApi.getById(id);

      // Check if status changed
      setOrder(prevOrder => {
        if (prevOrder && (prevOrder.deliveryStatus !== data.deliveryStatus || prevOrder.isDelivered !== data.isDelivered)) {
          setStatusUpdateNotification(true);
          // Clear previous timeout
          if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
          // Set new timeout
          notificationTimeoutRef.current = setTimeout(() => setStatusUpdateNotification(false), 5000);
        }
        return data;
      });

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.status === 404 ? 'Order not found' : 'Failed to load order');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, user, authLoading]);

  // Fetch reviews for delivered orders
  const fetchUserReviews = useCallback(async (orderData) => {
    if (!orderData || !orderData.isDelivered) return;

    const items = orderData.orderItems || [];
    for (const item of items) {
      const productId = item.product?._id;
      if (productId && typeof reviews[productId] === 'undefined' && !reviewsFetchedRef.current.has(productId)) {
        reviewsFetchedRef.current.add(productId);
        try {
          setReviewLoading(prev => ({ ...prev, [productId]: true }));
          const data = await reviewsApi.getUserReview(productId, orderData._id);
          setReviews(prev => ({ ...prev, [productId]: data.review }));
        } catch (err) {
          console.error('Failed to fetch review:', err);
        } finally {
          setReviewLoading(prev => ({ ...prev, [productId]: false }));
        }
      }
    }
  }, [reviews]);

  // Submit review handler
  const submitReview = useCallback(async (productId, rating, comment) => {
    if (!order || !order.isDelivered) return;
    
    try {
      setReviewLoading(prev => ({ ...prev, [productId]: true }));
      setReviewErrors(prev => ({ ...prev, [productId]: null }));
      const data = await reviewsApi.createOrUpdate({
        productId,
        orderId: order._id,
        rating,
        comment
      });
      setReviews(prev => ({ ...prev, [productId]: data.review }));
    } catch (err) {
      setReviewErrors(prev => ({ ...prev, [productId]: err.response?.data?.message || 'Failed to submit review' }));
    } finally {
      setReviewLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, [order]);

  // Update submitReviewRef whenever submitReview changes
  useEffect(() => {
    submitReviewRef.current = submitReview;
  }, [submitReview]);

  // Stable no-op handler
  const noOpHandler = useCallback(() => {}, []);

  // Memoized review handlers
  const productIdsKey = useMemo(() => {
    if (!order?.orderItems) return '';
    return order.orderItems
      .map(item => item.product?._id)
      .filter(Boolean)
      .sort()
      .join(',');
  }, [order?._id]);

  const reviewSubmitHandlers = useMemo(() => {
    if (!order?.orderItems) return handlersRef.current;
    
    const currentProductIds = new Set(
      order.orderItems
        .map(item => item.product?._id)
        .filter(Boolean)
    );
    
    // Clean up old handlers
    handlersRef.current.forEach((_, productId) => {
      if (!currentProductIds.has(productId)) {
        handlersRef.current.delete(productId);
      }
    });
    
    // Create new handlers
    currentProductIds.forEach(productId => {
      if (!handlersRef.current.has(productId)) {
        handlersRef.current.set(productId, (rating, comment) => {
          if (submitReviewRef.current) {
            submitReviewRef.current(productId, rating, comment);
          }
        });
      }
    });
    
    return handlersRef.current;
  }, [productIdsKey, order]);

  // CONSOLIDATED EFFECTS - Reduced from 3 to 2
  
  // Effect 1: Initial load and auto-refresh setup
  useEffect(() => {
    fetchOrder();

    // Set up auto-refresh interval for active orders
    const setupAutoRefresh = () => {
      const shouldAutoRefresh = order && order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'cancelled';

      if (shouldAutoRefresh && !autoRefreshRef.current) {
        autoRefreshRef.current = setInterval(() => {
          if (document.visibilityState === 'visible' && user && !authLoading) {
            fetchOrder(true);
          }
        }, 30000);
      } else if (!shouldAutoRefresh && autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };

    setupAutoRefresh();

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [id, user, authLoading, order?.deliveryStatus, order?.isDelivered, fetchOrder]);

  // Effect 2: Fetch reviews when order is delivered
  useEffect(() => {
    if (order && order.isDelivered) {
      fetchUserReviews(order);
    }
  }, [order?._id, order?.isDelivered, fetchOrder, fetchUserReviews]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) clearTimeout(notificationTimeoutRef.current);
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, []);

  // Handlers
  const handleRefresh = useCallback(() => {
    fetchOrder(true);
  }, [fetchOrder]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="order-detail-loading">
        <Navbar />
        <div className="order-detail-loading-content">
          <div className="order-detail-loading-emoji">⏳</div>
          <h2 className="order-detail-loading-title">Loading...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="order-detail-error">
        <Navbar />
        <div className="order-detail-loading-content">
          <div className="order-detail-loading-emoji">🔒</div>
          <h2 className="order-detail-loading-title">Please Login to View Order</h2>
          <Link to="/login" className="order-detail-error-button">
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="order-detail-error">
        <Navbar />
        <div className="order-detail-loading-content">
          <div className="order-detail-loading-emoji">❌</div>
          <h2 className="order-detail-loading-title">{error || 'Order not found'}</h2>
          <Link to="/orders" className="order-detail-error-button">
            Back to Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  // Get order status information
  const orderStatus = order ? getOrderStatus(order.paymentStatus, order.isDelivered, order.deliveryStatus) : null;

  return (
    <div className="order-detail-container">
      <Navbar />
      <div className="order-detail-wrapper">
        {/* Back Button */}
        <button className="order-detail-back-btn" onClick={() => navigate('/orders')}>
          ← Back to Orders
        </button>

        {/* Order Header */}
        <div className="order-detail-card">
          <div className="order-detail-header">
            <div className="order-detail-header-left">
              <div className="order-number-label">Order Number</div>
              <h1 className="order-number">{formatOrderNumber(order._id)}</h1>
              <div className="order-date">
                <span>📅</span>
                <span>
                  Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
              {lastUpdated && <div className="order-last-updated">Last updated: {lastUpdated.toLocaleString()}</div>}
            </div>

            <div className="order-detail-header-right">
              <button className="order-refresh-btn" onClick={handleRefresh} disabled={refreshing}>
                {refreshing ? (
                  <>
                    <div className="order-refresh-spinner"></div>
                    Refreshing...
                  </>
                ) : (
                  <>🔄 Refresh</>
                )}
              </button>

              {statusUpdateNotification && (
                <div className="order-status-notification">
                  <span>✨</span>
                  Order status has been updated!
                </div>
              )}

              <div className="order-total-section">
                <div className="order-total-label">Order Total</div>
                <div className="order-total-amount">₹{order.totalPrice?.toFixed(2) || '0.00'}</div>
              </div>
            </div>
          </div>

          {/* Order Status */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <span>📊</span>
              Current Status
            </div>
            <div className="order-status-badge" style={{ background: orderStatus?.bgColor || '#f5f5f5', color: orderStatus?.color || '#666' }}>
              <span className="order-status-icon">
                {order?.isDelivered ? '✅' :
                 order?.deliveryStatus === 'processing' ? '🔄' :
                 order?.deliveryStatus === 'shipped' ? '📦' :
                 order?.deliveryStatus === 'out_for_delivery' ? '🚚' : '⏳'}
              </span>
              <span>{orderStatus?.text || 'Processing'}</span>
            </div>
            {order?.deliveryStatus === 'delivered' && order?.deliveredAt && (
              <div style={{
                fontSize: '14px',
                color: '#666',
                marginTop: '12px',
                fontWeight: '500'
              }}>
                ✅ Delivered on {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            )}
          </div>

          {/* Tracking Information */}
          {order?.trackingId && ['shipped', 'out_for_delivery', 'delivered'].includes(order.deliveryStatus) && (
            <div className="order-tracking-section">
              <h3 className="order-tracking-title">📦 Tracking Information</h3>
              <div className="order-tracking-content">
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Tracking ID</div>
                  <div className="order-tracking-id">{order.trackingId}</div>
                </div>
                <div className="order-tracking-description">
                  You can track your order using this ID with our delivery partner. Keep this ID safe for reference.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Order Timeline */}
        <div className="order-detail-card">
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#333',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📋</span>
            Order Timeline
          </h2>

          <div className="order-timeline">
            {/* Order Placed */}
            <div className="status-timeline-item">
              <div className={`status-icon ${order ? 'completed' : 'pending'}`}>
                ✓
              </div>
              <div>
                <div className="status-timeline-title">Order Placed</div>
                <div className="status-timeline-description">Your order has been successfully placed</div>
                <div className="status-timeline-date">
                  {order?.createdAt ? new Date(order.createdAt).toLocaleString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'Processing...'}
                </div>
              </div>
            </div>

            {/* Payment Confirmed */}
            {order?.isPaid && (
              <div className="status-timeline-item">
                <div className="status-icon completed">💳</div>
                <div>
                  <div className="status-timeline-title">Payment Confirmed</div>
                  <div className="status-timeline-description">Payment has been successfully processed</div>
                  <div className="status-timeline-date">
                    {order.paidAt ? new Date(order.paidAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Confirmed'}
                  </div>
                </div>
              </div>
            )}

            {/* Order Processing */}
            {(order?.deliveryStatus === 'processing' || order?.deliveryStatus === 'shipped' || order?.deliveryStatus === 'out_for_delivery' || order?.deliveryStatus === 'delivered') && (
              <div className="status-timeline-item">
                <div className={`status-icon ${['processing', 'shipped', 'out_for_delivery', 'delivered'].includes(order.deliveryStatus) ? 'completed' : 'active'}`}>
                  🔄
                </div>
                <div>
                  <div className="status-timeline-title">Order Processing</div>
                  <div className="status-timeline-description">Your order is being prepared for shipment</div>
                  <div className="status-timeline-date">In progress</div>
                </div>
              </div>
            )}

            {/* Order Shipped */}
            {(order?.deliveryStatus === 'shipped' || order?.deliveryStatus === 'out_for_delivery' || order?.deliveryStatus === 'delivered') && (
              <div className="status-timeline-item">
                <div className={`status-icon ${['shipped', 'out_for_delivery', 'delivered'].includes(order.deliveryStatus) ? 'completed' : 'pending'}`}>
                  📦
                </div>
                <div>
                  <div className="status-timeline-title">Order Shipped</div>
                  <div className="status-timeline-description">
                    Your order has been shipped and is on its way
                    {order?.trackingId && (
                      <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#1976d2' }}>
                        Tracking ID: {order.trackingId}
                      </span>
                    )}
                  </div>
                  <div className="status-timeline-date">Shipped</div>
                </div>
              </div>
            )}

            {/* Out for Delivery */}
            {(order?.deliveryStatus === 'out_for_delivery' || order?.deliveryStatus === 'delivered') && (
              <div className="status-timeline-item">
                <div className={`status-icon ${order?.deliveryStatus === 'delivered' ? 'completed' : 'active'}`}>
                  🚚
                </div>
                <div>
                  <div className="status-timeline-title">Out for Delivery</div>
                  <div className="status-timeline-description">Your order is out for delivery and will arrive soon</div>
                  <div className="status-timeline-date">Out for delivery</div>
                </div>
              </div>
            )}

            {/* Delivered */}
            {order?.deliveryStatus === 'delivered' && (
              <div className="status-timeline-item">
                <div className="status-icon completed">✅</div>
                <div>
                  <div className="status-timeline-title">Order Delivered</div>
                  <div className="status-timeline-description">Your order has been successfully delivered</div>
                  <div className="status-timeline-date">
                    {order?.deliveredAt ? new Date(order.deliveredAt).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'Delivered'}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Items and Summary */}
        <div className="order-items-container">
          {/* Order Items */}
          <div className="order-detail-card">
            <h2 style={{
              fontSize: '24px',
              fontWeight: '700',
              color: '#333',
              margin: '0 0 24px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>🛒</span>
              Order Items ({order?.orderItems?.length || 0})
            </h2>

            <div className="order-items-list">
              {order?.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  className="order-item"
                  onClick={() => item.product && navigate(`/products/${item.product._id}`)}
                >
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="order-item-image"
                    />
                  )}

                  <div className="order-item-details">
                    <div className="order-item-name">
                      {item.product?.name || 'Product Unavailable'}
                    </div>

                    <div className="order-item-meta">
                      <span>Qty: {item.qty}</span>
                      <span>₹{item.price?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div className="order-item-subtotal">
                      ₹{(item.qty * (item.price || 0)).toFixed(2)}
                    </div>
                  </div>

                  {/* Review Section for Delivered Orders */}
                  {order?.isDelivered && item.product && (
                    <div 
                      className="order-item-reviews"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ReviewForm
                        productId={item.product._id}
                        onSubmit={reviewSubmitHandlers.get(item.product._id) || noOpHandler}
                        loading={reviewLoading[item.product._id]}
                        error={reviewErrors[item.product._id]}
                      />
                      {reviews[item.product._id] && (
                        <RatingDisplay rating={reviews[item.product._id].rating} size="small" />
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-summary-container">
            <div className="order-detail-card order-summary-card">
              <h3 className="order-summary-title">
                <span>📄</span>
                Order Summary
              </h3>

              <div className="order-summary-card">
                <div className="order-summary-row">
                  <span className="order-summary-label">Subtotal:</span>
                  <span className="order-summary-value">
                    ₹{order?.subtotal?.toFixed(2) || order?.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>

                {order?.deliveryCharge > 0 && (
                  <div className="order-summary-row">
                    <span className="order-summary-label">Delivery Charge:</span>
                    <span className="order-summary-value">
                      ₹{order.deliveryCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {order?.discount > 0 && (
                  <div className="order-summary-row">
                    <span className="order-summary-label">
                      Discount {order.promoCode && `(${order.promoCode})`}:
                    </span>
                    <span className="order-summary-value order-summary-discount">
                      -₹{order.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="order-summary-divider"></div>

                <div className="order-summary-row">
                  <span className="order-summary-total-label">Total:</span>
                  <span className="order-summary-total-value">
                    ₹{order?.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {(order?.transactionId || order?.paymentMethod) && (
              <div className="order-detail-card">
                <h3 className="order-summary-title">
                  <span>💳</span>
                  Payment Information
                </h3>

                <div className="payment-info-container">
                    {order.transactionId && (
                    <div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Transaction ID</div>
                      <div className="payment-transaction-id">{order.transactionId}</div>
                    </div>
                  )}

                  <div className="order-summary-row">
                    <span className="order-summary-label">Payment Method:</span>
                    <span className="order-summary-value">
                      {order.paymentMethod || 'Online Payment'}
                    </span>
                  </div>

                  <div className="order-summary-row">
                    <span className="order-summary-label">Payment Status:</span>
                    <span className={`payment-status ${order?.paymentStatus}`}>
                      {order?.paymentStatus?.charAt(0).toUpperCase() + order?.paymentStatus?.slice(1) || 'Pending'}
                    </span>
                  </div>

                  {order?.paidAt && (
                    <div className="order-summary-row">
                      <span className="order-summary-label">Paid At:</span>
                      <span className="order-summary-value" style={{ fontSize: '14px' }}>
                        {new Date(order.paidAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Shipping Address */}
            {order?.shippingAddress && (
              <div className="order-detail-card">
                <h3 className="order-summary-title">
                  <span>📍</span>
                  Shipping Address
                </h3>

                <div className="shipping-address-box">
                  <div className="shipping-address-text">
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city}, {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Information */}
            {order?.user && (
              <div className="order-detail-card">
                <h3 className="order-summary-title">
                  <span>👤</span>
                  Customer Information
                </h3>

                <div className="customer-info-container">
                  <div className="customer-info-row">
                    <span className="customer-info-label">Name:</span>
                    <span className="customer-info-value">
                      {order.user.name || 'N/A'}
                    </span>
                  </div>

                  <div className="customer-info-row">
                    <span className="customer-info-label">Email:</span>
                    <span className="customer-info-value">
                      {order.user.email || 'N/A'}
                    </span>
                  </div>

                  {order.user.phone && (
                    <div className="customer-info-row">
                      <span className="customer-info-label">Phone:</span>
                      <span className="customer-info-value">
                        {order.user.phone}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderDetail;
