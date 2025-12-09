import { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import { ordersApi } from '../services/ordersApi.js';
import { reviewsApi } from '../services/reviewsApi.js';
import RatingDisplay from '../components/RatingDisplay.jsx';

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

  const fetchOrder = useCallback(async () => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.getById(id);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.status === 404 ? 'Order not found' : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id, user, authLoading]);

  // Fetch user reviews for all products in the order
  const fetchUserReviews = useCallback(async () => {
    if (!order || !order.isDelivered) return;

    for (const item of order.orderItems) {
      const productId = item.product?._id;
      if (productId) {
        try {
          setReviewLoading(prev => ({ ...prev, [productId]: true }));
          const data = await reviewsApi.getUserReview(productId, order._id);
          setReviews(prev => ({ ...prev, [productId]: data.review }));
        } catch (err) {
          console.error('Failed to fetch review:', err);
        } finally {
          setReviewLoading(prev => ({ ...prev, [productId]: false }));
        }
      }
    }
  }, [order]);

  // Submit or update a review
  const submitReview = useCallback(async (productId, rating, comment) => {
    if (!order || !order.isDelivered) return;

    try {
      setReviewLoading(prev => ({ ...prev, [productId]: true }));
      setReviewErrors(prev => ({ ...prev, [productId]: null }));

      const reviewData = {
        productId,
        orderId: order._id,
        rating: parseInt(rating),
        comment: comment.trim()
      };

      const result = await reviewsApi.createOrUpdateReview(reviewData);
      setReviews(prev => ({ ...prev, [productId]: result }));
    } catch (err) {
      console.error('Failed to submit review:', err);
      setReviewErrors(prev => ({
        ...prev,
        [productId]: err.response?.data?.message || 'Failed to submit review'
      }));
    } finally {
      setReviewLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, [order]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (order) {
      fetchUserReviews();
    }
  }, [order, fetchUserReviews]);

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
            Sign In
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
        <Navbar />
        <div style={{ textAlign: 'center', padding: '100px 20px' }}>
          <div style={{ fontSize: '48px', marginBottom: '20px' }}>⏳</div>
          <p style={{ fontSize: '20px', color: '#666' }}>Loading order details...</p>
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

  return (
    <div style={{ minHeight: '100vh', background: '#f8f9fa' }}>
      <Navbar />
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 20px' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'white',
            border: '2px solid #e0e0e0',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            color: '#666',
            marginBottom: '30px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.target.style.borderColor = '#4caf50';
            e.target.style.color = '#4caf50';
          }}
          onMouseLeave={(e) => {
            e.target.style.borderColor = '#e0e0e0';
            e.target.style.color = '#666';
          }}
        >
          ← Back to Orders
        </button>

        {/* Order Header */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
            <div>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Order Number
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 'bold',
                color: '#1b5e20',
                marginBottom: '10px'
              }}>
                #{order._id.slice(-8).toUpperCase()}
              </h1>
              <div style={{
                fontSize: '14px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
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
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{
                fontSize: '12px',
                color: '#666',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                Order Total
              </div>
              <div style={{
                fontSize: '36px',
                fontWeight: 'bold',
                color: '#4caf50',
                marginBottom: '15px'
              }}>
                ₹{order.totalPrice?.toFixed(2) || '0.00'}
              </div>
              <div style={{
                padding: '10px 20px',
                borderRadius: '50px',
                background: order.isDelivered ? '#e8f5e9' : '#fff3e0',
                color: order.isDelivered ? '#2e7d32' : '#e65100',
                fontWeight: '600',
                fontSize: '14px',
                display: 'inline-block'
              }}>
                {order.isDelivered ? '✅ Delivered' : '⏳ Processing'}
              </div>
            </div>
          </div>

          {/* Order Status Timeline */}
          <div style={{
            padding: '20px',
            background: '#f8f9fa',
            borderRadius: '12px',
            marginTop: '20px'
          }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: '#333',
              marginBottom: '15px'
            }}>
              Order Status
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: '#4caf50',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '12px'
                }}>
                  ✓
                </div>
                <div>
                  <div style={{ fontWeight: '600', color: '#333' }}>Order Placed</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </div>
              {order.isPaid && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Payment Confirmed</div>
                    {order.paidAt && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(order.paidAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {order.isDelivered ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#4caf50',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    ✓
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#333' }}>Delivered</div>
                    {order.deliveredAt && (
                      <div style={{ fontSize: '12px', color: '#666' }}>
                        {new Date(order.deliveredAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: '#e0e0e0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#999',
                    fontWeight: 'bold',
                    fontSize: '12px'
                  }}>
                    ○
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', color: '#999' }}>Out for Delivery</div>
                    <div style={{ fontSize: '12px', color: '#999' }}>Pending</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{
          background: 'white',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
          marginBottom: '30px'
        }}>
          <h2 style={{
            fontSize: '24px',
            fontWeight: 'bold',
            color: '#333',
            marginBottom: '30px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}>
            <span>📦</span>
            <span>Order Items ({order.orderItems?.length || 0})</span>
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {order.orderItems?.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  gap: '20px',
                  padding: '20px',
                  background: '#f8f9fa',
                  borderRadius: '12px',
                  border: '1px solid #e0e0e0'
                }}
              >
                {item.product?.image && (
                  <Link to={`/products/${item.product._id}`} style={{ textDecoration: 'none' }}>
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '12px',
                        cursor: 'pointer'
                      }}
                    />
                  </Link>
                )}
                <div style={{ flex: 1 }}>
                  <Link to={`/products/${item.product?._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '10px',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#4caf50'}
                    onMouseLeave={(e) => e.target.style.color = '#333'}
                    >
                      {item.product?.name || 'Product'}
                    </h3>
                  </Link>
                  {item.product?.category && (
                    <div style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: '#e8f5e9',
                      color: '#4caf50',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      marginBottom: '10px'
                    }}>
                      {item.product.category}
                    </div>
                  )}
                  <div style={{
                    fontSize: '14px',
                    color: '#666',
                    marginTop: '10px'
                  }}>
                    Quantity: <strong>{item.qty}</strong>
                  </div>
                  <div style={{
                    fontSize: '14px',
                    color: '#666'
                  }}>
                    Unit Price: <strong>₹{item.price?.toFixed(2) || '0.00'}</strong>
                  </div>
                </div>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: '#4caf50',
                  textAlign: 'right'
                }}>
                  ₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}
                </div>

                {/* Review Section - Only show for delivered orders */}
                {order?.isDelivered && item.product && (
                  <div style={{
                    marginTop: '15px',
                    padding: '20px',
                    background: '#fff',
                    borderRadius: '12px',
                    border: '1px solid #e0e0e0'
                  }}>
                    <h4 style={{
                      fontSize: '18px',
                      fontWeight: '600',
                      color: '#333',
                      marginBottom: '15px'
                    }}>
                      📝 Rate & Review This Product
                    </h4>

                    {reviews[item.product._id] ? (
                      // Show existing review
                      <div style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                          <span style={{ fontWeight: '600' }}>Your Rating:</span>
                          <RatingDisplay rating={reviews[item.product._id].rating} size="small" showCount={false} />
                        </div>
                        {reviews[item.product._id].comment && (
                          <div style={{ marginBottom: '10px' }}>
                            <span style={{ fontWeight: '600' }}>Your Review:</span>
                            <p style={{ margin: '5px 0', color: '#666', fontStyle: 'italic' }}>
                              "{reviews[item.product._id].comment}"
                            </p>
                          </div>
                        )}
                        <button
                          onClick={() => setReviews(prev => ({ ...prev, [item.product._id]: null }))}
                          style={{
                            padding: '8px 16px',
                            background: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '14px'
                          }}
                        >
                          ✏️ Edit Review
                        </button>
                      </div>
                    ) : (
                      // Show review form
                      <ReviewForm
                        productId={item.product._id}
                        onSubmit={(rating, comment) => submitReview(item.product._id, rating, comment)}
                        loading={reviewLoading[item.product._id]}
                        error={reviewErrors[item.product._id]}
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
          {/* Order Summary Breakdown */}
          <div style={{
            marginTop: '30px',
            paddingTop: '30px',
            borderTop: '2px solid #e0e0e0'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              fontSize: '16px',
              color: '#666'
            }}>
              <span>Subtotal:</span>
              <span style={{ fontWeight: '600', color: '#333' }}>
                ₹{order.subtotal?.toFixed(2) || order.totalPrice?.toFixed(2) || '0.00'}
              </span>
            </div>
            {order.discount > 0 && (
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '15px',
                fontSize: '16px',
                color: '#28a745'
              }}>
                <span>Discount {order.promoCode && `(${order.promoCode})`}:</span>
                <span style={{ fontWeight: '600' }}>
                  -₹{order.discount.toFixed(2)}
                </span>
              </div>
            )}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '15px',
              fontSize: '16px',
              color: '#666'
            }}>
              <span>Delivery Charge:</span>
              <span style={{ fontWeight: '600', color: '#333' }}>
                ₹{order.deliveryCharge?.toFixed(2) || '0.00'}
              </span>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              paddingTop: '15px',
              borderTop: '1px solid #e0e0e0',
              marginTop: '15px'
            }}>
              <div style={{ fontSize: '20px', fontWeight: '600', color: '#333' }}>
                Total Amount:
              </div>
              <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#4caf50' }}>
                ₹{order.totalPrice?.toFixed(2) || '0.00'}
              </div>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '40px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
            marginBottom: '30px'
          }}>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 'bold',
              color: '#333',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>📍</span>
              <span>Shipping Address</span>
            </h2>
            <div style={{
              padding: '20px',
              background: '#f8f9fa',
              borderRadius: '12px',
              fontSize: '16px',
              color: '#666',
              lineHeight: '1.8'
            }}>
              {order.shippingAddress.address}
              <br />
              {order.shippingAddress.city}, {order.shippingAddress.postalCode}
              <br />
              {order.shippingAddress.country}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

export default OrderDetail;

