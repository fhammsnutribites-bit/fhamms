import { Link, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/pages/order-success.css';

function OrderSuccess() {
  const location = useLocation();
  const order = location.state?.order;
  return (
    <div className="order-success">
      <Navbar />
      <div className="order-success__container">
        <div className="order-success__icon">🎉</div>
        <h1 className="order-success__title">Thank You for Your Order!</h1>
        {order ? (
          <>
            <div className="order-success__summary">
              <div><b>Order ID:</b> {order._id.slice(-8).toUpperCase()}</div>
              <div><b>Total:</b> ₹{order.totalPrice}</div>
              <div><b>Payment Method:</b> {order.paymentMethod}</div>
            </div>
            <Link to={`/orders/${order._id}`} className="order-success__view-details">View Order Details →</Link>
          </>
        ) : (
          <p className="order-success__text">We’ve received your order and will notify you when it’s processed.</p>
        )}
        <Link to="/products" className="order-success__continue">Continue Shopping</Link>
      </div>
      <Footer />
    </div>
  );
}
export default OrderSuccess;
