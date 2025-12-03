import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { API_URL } from '../config/api.js';
import '../styles/pages/checkout.css';

function Checkout() {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    postalCode: '',
    country: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('PhonePe');
  const [phonePeShow, setPhonePeShow] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);
  const [failedMessage, setFailedMessage] = useState('');

  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  const REQUIRED = {
    address: 'Address',
    city: 'City',
    postalCode: 'Postal Code',
    country: 'Country',
  };

  const redirectToSuccess = (order) => {
    clearCart();
    navigate('/order-success', { state: { order } });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError(null);
    setPaymentFailed(false);
    // Validate required fields
    for (let field in REQUIRED) {
      if (!formData[field] || !formData[field].trim()) {
        return;
      }
    }
    if (!user) {
      setError('Please login to checkout');
      return;
    }
    setLoading(true);
    try {
      if (paymentMethod === 'PhonePe') {
        setPhonePeShow(true);
        setLoading(false);
        return;
      } else {
        const token = localStorage.getItem('token');
        const orderData = {
          orderItems: cartItems.map(item => ({
            product: item._id,
            qty: item.qty,
            price: item.price,
            selectedWeight: item.selectedWeight
          })),
          shippingAddress: formData,
          totalPrice: total,
          paymentMethod
        };
        const { data } = await axios.post(
          `${API_URL}/api/orders`,
          orderData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        redirectToSuccess(data);
      }
    } catch (err) {
      setPaymentFailed(true);
      setFailedMessage(err.response?.data?.message || 'Order placement/payment failed. Please try again.');
     
    }
    setLoading(false);
  };

  // Simulated PhonePe Gateway completion
  const handlePhonePePaid = async () => {
    setLoading(true);
    setPaymentFailed(false);
    setFailedMessage('');
    // Validate again in the modal
    for (let field in REQUIRED) {
      if (!formData[field] || !formData[field].trim()) {
    
        setLoading(false);
        return;
      }
    }
    try {
      const token = localStorage.getItem('token');
      const orderData = {
        orderItems: cartItems.map(item => ({
          product: item._id,
          qty: item.qty,
          price: item.price,
          selectedWeight: item.selectedWeight
        })),
        shippingAddress: formData,
        totalPrice: total,
        paymentMethod
      };
      const { data } = await axios.post(
        `${API_URL}/api/orders`,
        orderData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPhonePeShow(false);
  
      redirectToSuccess(data);
    } catch (err) {
      setPaymentFailed(true);
      setPhonePeShow(false);
      setFailedMessage(err.response?.data?.message || 'PhonePe payment failed. Please try again.');
     
    }
    setLoading(false);
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout">
        <Navbar />
        <div className="checkout__container">
          <div className="checkout__empty">
            <p className="checkout__empty-text">Your cart is empty</p>
            <button 
              onClick={() => navigate('/products')} 
              className="checkout__empty-button"
            >
              Go Shopping
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="checkout">
      <Navbar />
      <div className="checkout__container">
        <h2 className="checkout__title">Checkout</h2>
        <div className="checkout__content">
          <div className="checkout__section">
            <h3 className="checkout__section-title">Shipping Address</h3>
            <form onSubmit={handleSubmit} className="checkout__form">
              <div className="checkout__field">
                <label className="checkout__label">Address <span style={{color:'red'}}>*</span></label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="checkout__input"
                />
              </div>
              <div className="checkout__field">
                <label className="checkout__label">City <span style={{color:'red'}}>*</span></label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="checkout__input"
                />
              </div>
              <div className="checkout__field">
                <label className="checkout__label">Postal Code <span style={{color:'red'}}>*</span></label>
                <input
                  type="text"
                  required
                  value={formData.postalCode}
                  onChange={e => setFormData({...formData, postalCode: e.target.value})}
                  className="checkout__input"
                />
              </div>
              <div className="checkout__field">
                <label className="checkout__label">Country <span style={{color:'red'}}>*</span></label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  onChange={e => setFormData({...formData, country: e.target.value})}
                  className="checkout__input"
                />
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Payment Method <span style={{color:'red'}}>*</span></label>
                <div className="checkout__payment-methods">
                  <label className="checkout__radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PhonePe"
                      checked={paymentMethod === 'PhonePe'}
                      onChange={() => setPaymentMethod('PhonePe')}
                      required
                    />
                    PhonePe Gateway (UPI)
                    <img
                      src="https://cdn.worldvectorlogo.com/logos/phonepe-1.svg"
                      alt="PhonePe Logo" width="38" style={{marginLeft:'8px',verticalAlign:'middle'}} />
                  </label>
                </div>
              </div>

              {error && <div className="checkout__error">{error}</div>}
              <button 
                type="submit" 
                disabled={loading} 
                className="checkout__button"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
          <div className="checkout__section">
            <h3 className="checkout__section-title">Order Summary</h3>
            {cartItems.map(item => (
              <div key={`${item._id}-${item.selectedWeight}`} className="checkout__summary-item">
                <div>
                  <div className="checkout__summary-item-name">{item.name}</div>
                  {item.selectedWeight && (
                    <div className="checkout__summary-item-details">
                      Weight: {item.selectedWeight}g × {item.qty}
                    </div>
                  )}
                  {!item.selectedWeight && (
                    <div className="checkout__summary-item-details">Qty: {item.qty}</div>
                  )}
                </div>
                <div>₹{(item.price * item.qty).toFixed(2)}</div>
              </div>
            ))}
            <div className="checkout__summary-total">
              Total: ₹{total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      {phonePeShow && (
        <div className="checkout__phonepe-modal">
          <div className="checkout__phonepe-content">
            <div className="checkout__phonepe-header">
              <img src="https://cdn.worldvectorlogo.com/logos/phonepe-1.svg" alt="PhonePe" style={{height:44, marginBottom:8}} />
              <h3>Pay securely via PhonePe UPI</h3>
            </div>
            <div className="checkout__phonepe-qr">
              {/* Demo QR: You can replace with your UPI QR code */}
              <img src="https://api.qrserver.com/v1/create-qr-code/?data=upi%3Apay%3Aphonepe%40upi&size=180x180" alt="PhonePe UPI QR" />
            </div>
            <div className="checkout__phonepe-desc">
              Scan this QR with PhonePe app to pay ₹{total.toFixed(2)} to <b>NutriBites</b>.<br/>
              <small>Demo only. (Integrate actual callback for production use.)</small>
            </div>
            <button className="checkout__button" style={{marginTop:16}} onClick={handlePhonePePaid}>
              I've Paid with PhonePe
            </button>
            <button className="checkout__empty-button" style={{marginTop:8}} onClick={()=>setPhonePeShow(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
      {paymentFailed && (
        <div className="checkout__phonepe-modal">
          <div className="checkout__phonepe-content">
            <div style={{fontSize:44, color:'#c62828', marginBottom:9}}>❌</div>
            <div style={{fontWeight:600, fontSize:18, color:'#c62828', marginBottom:15}}>Payment Failed</div>
            <div style={{marginBottom:14, color:'#c62828'}}>{failedMessage}</div>
            <button className="checkout__button" onClick={()=>setPaymentFailed(false)}>
              Try Again
            </button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
export default Checkout;
