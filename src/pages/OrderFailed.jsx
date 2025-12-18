import { Link, useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { getDisplayOrderNumber } from '../utils/orderUtils.js';
import '../styles/pages/order-failed.css';

function OrderFailed() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, errorMessage, order } = location.state || {};

  const handleRetryPayment = () => {
    // Navigate back to checkout if there's an order to retry
    if (orderId) {
      navigate('/checkout');
    } else {
      navigate('/cart');
    }
  };

  return (
    <div className="order-failed">
      <Navbar />
      <div className="order-failed__container">
        <div className="order-failed__icon">❌</div>
        <h1 className="order-failed__title">Payment Failed</h1>
        <p className="order-failed__message">
          {errorMessage || "Your payment could not be processed. Please try again or contact support if the issue persists."}
        </p>

        {orderId && (
          <div className="order-failed__order-info">
            <div><b>{getDisplayOrderNumber(orderId)}:</b></div>
            {order?.totalPrice && <div><b>Amount:</b> ₹{order.totalPrice}</div>}
          </div>
        )}

        <div className="order-failed__actions">
          <button onClick={handleRetryPayment} className="order-failed__retry">
            Try Again
          </button>
          <Link to="/products" className="order-failed__continue">
            Continue Shopping
          </Link>
        </div>

        <div className="order-failed__support">
          <p>Need help? <Link to="/contact" className="order-failed__contact">Contact Support</Link></p>
          <small className="order-failed__note">
            If money was debited from your account, it will be refunded within 3-5 business days.
          </small>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default OrderFailed;


