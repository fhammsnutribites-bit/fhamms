import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { razorpayApi } from '../services/razorpayApi.js';
import { ordersApi } from '../services/ordersApi.js';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/Loader.jsx';
import '../styles/pages/payment-callback.css';

function PaymentCallback() {
  const { merchantTransactionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Verifying payment...');
    const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (!merchantTransactionId) {
          setStatus('error');
          setMessage('Invalid payment reference');
          setLoading(false);
          return;
        }
        // Get payment details from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('order_id');
        const paymentId = urlParams.get('payment_id');
        if (orderId) {
          try {
            const order = await ordersApi.getById(orderId);
            setOrderId(order?._id || null);
            if (paymentId && order.isPaid && order.paymentStatus === 'success') {
              setStatus('success');
              setMessage('Payment successful! Redirecting to order details...');
              setTimeout(() => {
                navigate(`/orders/${order._id}`);
              }, 3000);
            } else if (order.paymentStatus === 'failed') {
              setStatus('failed');
              setMessage('Payment failed. Redirecting to order details...');
              setTimeout(() => {
                navigate(`/orders/${order._id}`);
              }, 3000);
            } else {
              setStatus('pending');
              setMessage('Payment is being processed. Please wait...');
              setTimeout(() => verifyPayment(), 5000);
            }
          } catch (orderError) {
            console.error('Error fetching order:', orderError);
            setStatus('error');
            setMessage('Order not found. Please contact support.');
            setOrderId(null);
          }
        } else {
          setStatus('error');
          setMessage('Order ID missing in payment callback.');
          setOrderId(null);
        }
      } catch (err) {
        setStatus('error');
        setMessage('Payment verification failed. Please contact support.');
        setOrderId(null);
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [merchantTransactionId, navigate]);

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return '✅';
      case 'failed':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '⏳';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return '#4caf50';
      case 'failed':
        return '#f44336';
      case 'error':
        return '#ff9800';
      default:
        return '#2196f3';
    }
  };

  if (loading && status === 'processing') {
    return (
      <div className="payment-callback">
        <Navbar />
        <Loader size="large" text="Verifying your payment..." fullPage={false} />
        <Footer />
      </div>
    );
  }

  return (
    <div className="payment-callback">
      <Navbar />
      <div className="payment-callback__container">
        <div className="payment-callback__card">
          <div className="payment-callback__icon" style={{ color: getStatusColor() }}>
            {getStatusIcon()}
          </div>
          <h1 className="payment-callback__title">
            {status === 'success' ? 'Payment Successful!' :
             status === 'failed' ? 'Payment Failed' :
             status === 'error' ? 'Payment Error' : 'Processing Payment'}
          </h1>
          <p className="payment-callback__message">{message}</p>

          {status !== 'processing' && (
            <div className="payment-callback__details">
              <div className="payment-callback__detail-item">
                <span className="payment-callback__label">Transaction ID:</span>
                <span className="payment-callback__value">{merchantTransactionId}</span>
              </div>
            </div>
          )}

          <div className="payment-callback__actions">
            {orderId && (
              <button
                onClick={() => navigate(`/orders/${orderId}`)}
                className="payment-callback__button payment-callback__button--primary"
              >
                View Order Details
              </button>
            )}
            <button
              onClick={() => navigate('/orders')}
              className="payment-callback__button payment-callback__button--secondary"
            >
              View All Orders
            </button>
            <button
              onClick={() => navigate('/products')}
              className="payment-callback__button payment-callback__button--tertiary"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default PaymentCallback;
