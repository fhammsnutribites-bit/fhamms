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

function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState({});
  const [reviewLoading, setReviewLoading] = useState({});
  const [reviewErrors, setReviewErrors] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [statusUpdateNotification, setStatusUpdateNotification] = useState(false);
  const [previousStatus, setPreviousStatus] = useState(null);

  const fetchOrder = useCallback(async (isRefresh = false) => {
    if (authLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setError(null);

    try {
      const data = await ordersApi.getById(id);

      // Check if status has changed (access current order state directly)
      const currentOrder = order;
      if (currentOrder && (currentOrder.deliveryStatus !== data.deliveryStatus || currentOrder.isDelivered !== data.isDelivered)) {
        setStatusUpdateNotification(true);
        setTimeout(() => setStatusUpdateNotification(false), 5000);
      }

      setPreviousStatus(currentOrder ? `${currentOrder.deliveryStatus}-${currentOrder.isDelivered}` : null);
      setOrder(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.status === 404 ? 'Order not found' : 'Failed to load order');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [id, user, authLoading]);

  const handleRefresh = useCallback(() => {
    fetchOrder(true);
  }, [fetchOrder]);

  const reviewsFetchedRef = useRef(new Set());

  const fetchUserReviews = useCallback(async () => {
    const currentOrder = order;
    if (!currentOrder || !currentOrder.isDelivered) return;

    for (const item of currentOrder.orderItems) {
      const productId = item.product?._id;
      // Only fetch if review is undefined and we haven't tried to fetch it before
      if (productId && typeof reviews[productId] === 'undefined' && !reviewsFetchedRef.current.has(productId)) {
        reviewsFetchedRef.current.add(productId);
        try {
          setReviewLoading(prev => ({ ...prev, [productId]: true }));
          const data = await reviewsApi.getUserReview(productId, currentOrder._id);
          setReviews(prev => ({ ...prev, [productId]: data.review }));
        } catch (err) {
          console.error('Failed to fetch review:', err);
        } finally {
          setReviewLoading(prev => ({ ...prev, [productId]: false }));
        }
      }
    }
  }, []);

  const submitReview = useCallback(async (productId, rating, comment) => {
    const currentOrder = order;
    if (!currentOrder || !currentOrder.isDelivered) return;
    try {
      setReviewLoading(prev => ({ ...prev, [productId]: true }));
      setReviewErrors(prev => ({ ...prev, [productId]: null }));
      const data = await reviewsApi.createOrUpdate({
        productId,
        orderId: currentOrder._id,
        rating,
        comment
      });
      setReviews(prev => ({ ...prev, [productId]: data.review }));
    } catch (err) {
      setReviewErrors(prev => ({ ...prev, [productId]: err.response?.data?.message || 'Failed to submit review' }));
    } finally {
      setReviewLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, []);

  // Stable no-op function for missing handlers
  const noOpHandler = useCallback(() => {}, []);

  // Use ref to store stable handler functions and submitReview
  const handlersRef = useRef(new Map());
  const submitReviewRef = useRef(submitReview);
  
  // Keep submitReview ref updated
  useEffect(() => {
    submitReviewRef.current = submitReview;
  }, [submitReview]);

  // Create stable product IDs key for dependency
  const productIdsKey = useMemo(() => {
    if (!order?.orderItems) return '';
    return order.orderItems
      .map(item => item.product?._id)
      .filter(Boolean)
      .sort()
      .join(',');
  }, [order?._id]);

  // Create stable handlers map that only updates when product IDs change
  const reviewSubmitHandlers = useMemo(() => {
    if (!order?.orderItems) return handlersRef.current;
    
    const currentProductIds = new Set(
      order.orderItems
        .map(item => item.product?._id)
        .filter(Boolean)
    );
    
    // Remove handlers for products no longer in order
    handlersRef.current.forEach((_, productId) => {
      if (!currentProductIds.has(productId)) {
        handlersRef.current.delete(productId);
      }
    });
    
    // Create or reuse handlers for current products
    currentProductIds.forEach(productId => {
      if (!handlersRef.current.has(productId)) {
        handlersRef.current.set(productId, (rating, comment) => {
          submitReviewRef.current(productId, rating, comment);
        });
      }
    });
    
    return handlersRef.current;
  }, [productIdsKey]);

  useEffect(() => {
    fetchOrder();
  }, [id, user, authLoading]);

  useEffect(() => {
    if (order && order.isDelivered) {
      fetchUserReviews();
    }
  }, [order?._id, order?.isDelivered]);

  // Auto-refresh for active orders (not delivered)
  const autoRefreshRef = useRef(null);

  useEffect(() => {
    const shouldAutoRefresh = order && order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'cancelled';

    if (shouldAutoRefresh && !autoRefreshRef.current) {
      // Start auto-refresh
      autoRefreshRef.current = setInterval(() => {
        if (document.visibilityState === 'visible' && user && !authLoading) {
          fetchOrder(true);
        }
      }, 30000);
    } else if (!shouldAutoRefresh && autoRefreshRef.current) {
      // Stop auto-refresh
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }

    return () => {
      if (autoRefreshRef.current) {
        clearInterval(autoRefreshRef.current);
        autoRefreshRef.current = null;
      }
    };
  }, [order?.deliveryStatus, order?.isDelivered, user, authLoading]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>⏳</div>
          <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '15px' }}>
            Loading...
          </h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>🔒</div>
          <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '15px' }}>
            Please Login to View Order
          </h2>
          <Link to="/login" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#4caf50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '50px',
            fontWeight: '600',
            fontSize: '16px',
            marginTop: '20px'
          }}>
            Login
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '64px', marginBottom: '20px' }}>❌</div>
          <h2 style={{ fontSize: '28px', color: '#333', marginBottom: '15px' }}>
            {error || 'Order not found'}
          </h2>
          <Link to="/orders" style={{
            display: 'inline-block',
            padding: '14px 32px',
            background: '#4caf50',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '50px',
            fontWeight: '600',
            fontSize: '16px',
            marginTop: '20px'
          }}>
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
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          @keyframes slideIn {
            0% { transform: translateX(100%); opacity: 0; }
            100% { transform: translateX(0); opacity: 1; }
          }

          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }

          .order-detail-card {
            background: white;
            border-radius: 16px;
            padding: 32px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            margin-bottom: 24px;
            animation: fadeIn 0.5s ease-out;
          }

          .status-timeline-item {
            display: flex;
            align-items: flex-start;
            gap: 16px;
            padding: 16px 0;
            position: relative;
          }

          .status-timeline-item:not(:last-child)::after {
            content: '';
            position: absolute;
            left: 12px;
            top: 40px;
            bottom: -16px;
            width: 2px;
            background: #e0e0e0;
          }

          .status-icon {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            flex-shrink: 0;
          }

          .status-icon.active {
            background: #4caf50;
            color: white;
          }

          .status-icon.completed {
            background: #4caf50;
            color: white;
          }

          .status-icon.pending {
            background: #e0e0e0;
            color: #666;
          }
        `}
      </style>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 24px',
            background: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            color: '#666',
            marginBottom: '24px',
            transition: 'all 0.3s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#4caf50';
            e.target.style.color = '#4caf50';
            e.target.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.color = '#666';
            e.target.style.transform = 'translateY(0)';
          }}
        >
          ← Back to Orders
        </button>

        {/* Order Header */}
        <div className="order-detail-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '24px', marginBottom: '24px' }}>
            <div style={{ flex: 1, minWidth: '280px' }}>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                fontWeight: '600'
              }}>
                Order Number
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: '700',
                color: '#1b5e20',
                margin: '0 0 8px 0',
                lineHeight: '1.2'
              }}>
                {formatOrderNumber(order._id)}
              </h1>
              <div style={{
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '8px'
              }}>
                <span>📅</span>
                <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</span>
              </div>
              {lastUpdated && (
                <div style={{
                  fontSize: '12px',
                  color: '#888',
                  fontWeight: '500'
                }}>
                  Last updated: {lastUpdated.toLocaleString()}
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'flex-end' }}>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  background: refreshing ? '#f5f5f5' : '#4caf50',
                  color: refreshing ? '#999' : 'white',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: refreshing ? 'not-allowed' : 'pointer',
                  fontWeight: '600',
                  fontSize: '14px',
                  transition: 'all 0.3s',
                  minWidth: '120px',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.2)'
                }}
              >
                {refreshing ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #999',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}></div>
                    Refreshing...
                  </>
                ) : (
                  <>
                    🔄 Refresh
                  </>
                )}
              </button>

              {statusUpdateNotification && (
                <div style={{
                  padding: '10px 16px',
                  background: '#4caf50',
                  color: 'white',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  boxShadow: '0 2px 8px rgba(76, 175, 80, 0.3)',
                  animation: 'slideIn 0.3s ease-out'
                }}>
                  <span>✨</span>
                  Order status has been updated!
                </div>
              )}

              <div style={{ textAlign: 'right', marginTop: '16px' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#666',
                  marginBottom: '4px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  fontWeight: '600'
                }}>
                  Order Total
                </div>
                <div style={{
                  fontSize: '32px',
                  fontWeight: '700',
                  color: '#4caf50',
                  lineHeight: '1.2'
                }}>
                  ₹{order.totalPrice?.toFixed(2) || '0.00'}
                </div>
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
            <div style={{
              padding: '20px 24px',
              borderRadius: '12px',
              background: orderStatus?.bgColor || '#f5f5f5',
              color: orderStatus?.color || '#666',
              fontWeight: '700',
              fontSize: '18px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '12px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              border: '2px solid rgba(255,255,255,0.3)'
            }}>
              <span style={{ fontSize: '24px' }}>
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
            <div style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%)',
              borderRadius: '12px',
              border: '1px solid #e1f5fe',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '18px',
                fontWeight: '600',
                color: '#1976d2',
                margin: '0 0 12px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📦 Tracking Information
              </h3>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                flexWrap: 'wrap'
              }}>
                <div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Tracking ID</div>
                  <div style={{
                    fontFamily: 'Courier New, monospace',
                    fontSize: '16px',
                    fontWeight: 'bold',
                    color: '#1976d2',
                    background: 'white',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    display: 'inline-block',
                    border: '2px solid #e3f2fd',
                    boxShadow: '0 2px 4px rgba(25, 118, 210, 0.1)'
                  }}>
                    {order.trackingId}
                  </div>
                </div>
                <div style={{ fontSize: '14px', color: '#555', maxWidth: '300px' }}>
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

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {/* Order Placed */}
            <div className="status-timeline-item">
              <div className={`status-icon ${order ? 'completed' : 'pending'}`}>
                ✓
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                  Order Placed
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Your order has been successfully placed
                </div>
                <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
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
                <div className={`status-icon completed`}>
                  💳
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    Payment Confirmed
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Payment has been successfully processed
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
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
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    Order Processing
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Your order is being prepared for shipment
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    In progress
                  </div>
                </div>
              </div>
            )}

            {/* Order Shipped */}
            {(order?.deliveryStatus === 'shipped' || order?.deliveryStatus === 'out_for_delivery' || order?.deliveryStatus === 'delivered') && (
              <div className="status-timeline-item">
                <div className={`status-icon ${['shipped', 'out_for_delivery', 'delivered'].includes(order.deliveryStatus) ? 'completed' : 'pending'}`}>
                  📦
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    Order Shipped
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Your order has been shipped and is on its way
                    {order?.trackingId && (
                      <span style={{ display: 'block', marginTop: '8px', fontSize: '13px', color: '#1976d2' }}>
                        Tracking ID: {order.trackingId}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    Shipped
                  </div>
                </div>
              </div>
            )}

            {/* Out for Delivery */}
            {(order?.deliveryStatus === 'out_for_delivery' || order?.deliveryStatus === 'delivered') && (
              <div className="status-timeline-item">
                <div className={`status-icon ${order?.deliveryStatus === 'delivered' ? 'completed' : 'active'}`}>
                  🚚
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    Out for Delivery
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Your order is out for delivery and will arrive soon
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
                    Out for delivery
                  </div>
                </div>
              </div>
            )}

            {/* Delivered */}
            {order?.deliveryStatus === 'delivered' && (
              <div className="status-timeline-item">
                <div className={`status-icon completed`}>
                  ✅
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    Order Delivered
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Your order has been successfully delivered
                  </div>
                  <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>
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
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start' }}>
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

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {order?.orderItems?.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    gap: '16px',
                    padding: '16px',
                    background: '#f8f9fa',
                    borderRadius: '12px',
                    border: '1px solid #e9ecef',
                    transition: 'all 0.3s',
                    cursor: item.product ? 'pointer' : 'default'
                  }}
                  onMouseEnter={(e) => {
                    if (item.product) {
                      e.currentTarget.style.transform = 'translateY(-2px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (item.product) {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = 'none';
                    }
                  }}
                  onClick={() => item.product && navigate(`/products/${item.product._id}`)}
                >
                  {item.product?.image && (
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        flexShrink: 0
                      }}
                    />
                  )}

                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: '600', color: '#333', fontSize: '16px' }}>
                      {item.product?.name || 'Product Unavailable'}
                    </div>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '14px', color: '#666' }}>
                      <span>Qty: {item.qty}</span>
                      <span>₹{item.price?.toFixed(2) || '0.00'}</span>
                    </div>

                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#4caf50' }}>
                      ₹{(item.qty * (item.price || 0)).toFixed(2)}
                    </div>
                  </div>

                  {/* Review Section for Delivered Orders */}
                  {order?.isDelivered && item.product && (
                    <div 
                      style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
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
          <div>
            <div className="order-detail-card">
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#333',
                margin: '0 0 20px 0',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <span>📄</span>
                Order Summary
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#666' }}>Subtotal:</span>
                  <span style={{ fontWeight: '600', color: '#333' }}>
                    ₹{order?.subtotal?.toFixed(2) || order?.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>

                {order?.deliveryCharge > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Delivery Charge:</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      ₹{order.deliveryCharge.toFixed(2)}
                    </span>
                  </div>
                )}

                {order?.discount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>
                      Discount {order.promoCode && `(${order.promoCode})`}:
                    </span>
                    <span style={{ fontWeight: '600', color: '#4caf50' }}>
                      -₹{order.discount.toFixed(2)}
                    </span>
                  </div>
                )}

                <div style={{
                  height: '1px',
                  background: '#e0e0e0',
                  margin: '8px 0'
                }}></div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: '#333' }}>Total:</span>
                  <span style={{ fontSize: '20px', fontWeight: '700', color: '#4caf50' }}>
                    ₹{order?.totalPrice?.toFixed(2) || '0.00'}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            {(order?.transactionId || order?.paymentMethod) && (
              <div className="order-detail-card">
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>💳</span>
                  Payment Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {order.transactionId && (
                    <div>
                      <div style={{ fontSize: '14px', color: '#666', marginBottom: '4px' }}>Transaction ID</div>
                      <div style={{
                        fontFamily: 'Courier New, monospace',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: '#333',
                        background: '#f8f9fa',
                        padding: '8px 12px',
                        borderRadius: '6px'
                      }}>
                        {order.transactionId}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Payment Method:</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      {order.paymentMethod || 'Online Payment'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Payment Status:</span>
                    <span style={{
                      fontWeight: '600',
                      color: order?.paymentStatus === 'success' ? '#4caf50' :
                             order?.paymentStatus === 'failed' ? '#f44336' :
                             order?.paymentStatus === 'pending' ? '#ff9800' : '#666',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      background: order?.paymentStatus === 'success' ? '#e8f5e9' :
                                 order?.paymentStatus === 'failed' ? '#ffebee' :
                                 order?.paymentStatus === 'pending' ? '#fff3e0' : '#f5f5f5'
                    }}>
                      {order?.paymentStatus?.charAt(0).toUpperCase() + order?.paymentStatus?.slice(1) || 'Pending'}
                    </span>
                  </div>

                  {order?.paidAt && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Paid At:</span>
                      <span style={{ fontWeight: '600', color: '#333', fontSize: '14px' }}>
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
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>📍</span>
                  Shipping Address
                </h3>

                <div style={{
                  padding: '16px',
                  background: '#f8f9fa',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef'
                }}>
                  <div style={{
                    fontSize: '16px',
                    color: '#333',
                    lineHeight: '1.6',
                    fontWeight: '500'
                  }}>
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
                <h3 style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#333',
                  margin: '0 0 20px 0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span>👤</span>
                  Customer Information
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Name:</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      {order.user.name || 'N/A'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#666' }}>Email:</span>
                    <span style={{ fontWeight: '600', color: '#333' }}>
                      {order.user.email || 'N/A'}
                    </span>
                  </div>

                  {order.user.phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#666' }}>Phone:</span>
                      <span style={{ fontWeight: '600', color: '#333' }}>
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
