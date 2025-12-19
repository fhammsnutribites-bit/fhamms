import { useState, useCallback, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import Loader from '../components/Loader.jsx';
import { promoCodeApi } from '../services/promoCodeApi.js';
import { ordersApi } from '../services/ordersApi.js';
import { deliveryChargeApi } from '../services/deliveryChargeApi.js';
import { addressApi } from '../services/addressApi.js';
import { razorpayApi } from '../services/razorpayApi.js';
import { getDisplayOrderNumber } from '../utils/orderUtils.js';

import '../styles/pages/checkout.css';

const REQUIRED_FIELDS = {
  address: 'Address',
  city: 'City',
  postalCode: 'Postal Code',
  country: 'Country',
};

function Checkout() {
  const { user } = useAuth();
  const { cartItems, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India'
  });
  const [pincodeError, setPincodeError] = useState('');
  const [validatingPincode, setValidatingPincode] = useState(false);
  const [isPincodeValid, setIsPincodeValid] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [promoCode, setPromoCode] = useState('');
  const [promoCodeError, setPromoCodeError] = useState('');
  const [promoCodeSuccess, setPromoCodeSuccess] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedPromoCode, setAppliedPromoCode] = useState(null);
  const [validatingPromo, setValidatingPromo] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [loadingDeliveryCharge, setLoadingDeliveryCharge] = useState(false);

  const subtotal = useMemo(() => 
    cartItems.reduce((sum, item) => sum + item.price * item.qty, 0),
    [cartItems]
  );
  
  const orderAmount = useMemo(() => subtotal - discount, [subtotal, discount]);
  
  const total = useMemo(() => orderAmount + deliveryCharge, [orderAmount, deliveryCharge]);

  // Calculate delivery charge when order amount changes
  useEffect(() => {
    const calculateDeliveryCharge = async () => {
      if (orderAmount <= 0) {
        setDeliveryCharge(0);
        return;
      }
      
      setLoadingDeliveryCharge(true);
      try {
        const data = await deliveryChargeApi.calculate(orderAmount);
        setDeliveryCharge(data.deliveryCharge || 0);
      } catch (err) {
        console.error('Failed to calculate delivery charge:', err);
        // Default to 0 if calculation fails
        setDeliveryCharge(0);
      } finally {
        setLoadingDeliveryCharge(false);
      }
    };

    calculateDeliveryCharge();
  }, [orderAmount]);
  
  // Check if any cart item has product discount
  // Disable promo codes if ANY item in cart is discounted
  const hasProductDiscount = useMemo(() =>
    cartItems.some(item => item.originalPrice && item.originalPrice > item.price),
    [cartItems]
  );

  const redirectToSuccess = useCallback((order) => {
    clearCart();
    navigate('/order-success', { state: { order } });
  }, [clearCart, navigate]);

  const navigateToFailed = useCallback((orderId, errorMessage, order = null) => {
    navigate('/order-failed', {
      state: {
        orderId,
        errorMessage,
        order
      }
    });
  }, [navigate]);

  const validatePromoCode = useCallback(async () => {
    if (!promoCode.trim()) {
      setPromoCodeError('Please enter a promo code');
      return;
    }

    // Check if any cart item has product discount
    if (hasProductDiscount) {
      setPromoCodeError('Promo codes cannot be applied when products already have discounts. Please remove discounted items from cart to use promo code.');
      setDiscount(0);
      setAppliedPromoCode(null);
      setPromoCodeSuccess('');
      return;
    }

    setValidatingPromo(true);
    setPromoCodeError('');
    setPromoCodeSuccess('');

    try {
      const data = await promoCodeApi.validate({
        code: promoCode.trim(),
        orderAmount: subtotal,
        userId: user?.id,
        cartItems: cartItems.map(item => ({
          price: item.price,
          originalPrice: item.originalPrice
        }))
      });

      if (data.valid) {
        setDiscount(data.discount);
        setAppliedPromoCode(data.code);
        setPromoCodeSuccess(data.message);
        setPromoCodeError('');
      } else {
        setPromoCodeError(data.message || 'Invalid promo code');
        setDiscount(0);
        setAppliedPromoCode(null);
        setPromoCodeSuccess('');
      }
    } catch (err) {
      setPromoCodeError(err.response?.data?.message || 'Failed to validate promo code');
      setDiscount(0);
      setAppliedPromoCode(null);
      setPromoCodeSuccess('');
    } finally {
      setValidatingPromo(false);
    }
  }, [promoCode, hasProductDiscount, subtotal, user?.id, cartItems]);

  const removePromoCode = useCallback(() => {
    setPromoCode('');
    setDiscount(0);
    setAppliedPromoCode(null);
    setPromoCodeError('');
    setPromoCodeSuccess('');
  }, []);

  const handlePincodeChange = useCallback(async (pincode) => {
    // Validate format first
    if (!addressApi.validatePincodeFormat(pincode)) {
      setPincodeError('Invalid pincode format. Please enter a valid 6-digit Indian pincode.');
      setFormData(prev => ({...prev, city: '', state: ''}));
      setIsPincodeValid(false);
      return;
    }

    setValidatingPincode(true);
    setPincodeError('');
    setIsPincodeValid(false);

    try {
      const result = await addressApi.getAddressByPincode(pincode);
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          city: result.city || '',
          state: result.state || '',
          country: result.country || 'India'
        }));
        setPincodeError('');
        setIsPincodeValid(true);
      } else {
        setPincodeError(result.message || 'Invalid pincode. Please enter a valid Indian pincode.');
        setFormData(prev => ({...prev, city: '', state: ''}));
        setIsPincodeValid(false);
      }
    } catch (err) {
      console.error('Pincode validation error:', err);
      setPincodeError('Failed to validate pincode. Please try again.');
      setFormData(prev => ({...prev, city: '', state: ''}));
      setIsPincodeValid(false);
    } finally {
      setValidatingPincode(false);
    }
  }, []);

  const validateForm = useCallback(() => {
    // Check all required fields
    for (const field in REQUIRED_FIELDS) {
      if (!formData[field] || !formData[field].trim()) {
        return false;
      }
    }
    
    // Check if state field is filled (required for pincode validation)
    if (!formData.state || !formData.state.trim()) {
      return false;
    }
    
    // Check if pincode is valid and city/state are populated
    if (!isPincodeValid || !formData.city || !formData.state) {
      return false;
    }
    
    // Validate pincode format
    if (formData.postalCode.length !== 6 || !addressApi.validatePincodeFormat(formData.postalCode)) {
      return false;
    }
    
    return true;
  }, [formData, isPincodeValid]);

  const createOrderData = useCallback(() => ({
    orderItems: cartItems.map(item => ({
      product: item._id,
      qty: item.qty,
      price: item.price,
      originalPrice: item.originalPrice || item.price,
      selectedWeight: item.selectedWeight
    })),
    shippingAddress: formData,
    subtotal: subtotal,
    discount: discount,
    deliveryCharge: deliveryCharge,
    totalPrice: total,
    paymentMethod,
    promoCode: appliedPromoCode || undefined
  }), [cartItems, formData, subtotal, discount, deliveryCharge, total, paymentMethod, appliedPromoCode]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }
    
    if (!user) {
      setError('Please login to checkout');
      return;
    }
    
    setLoading(true);
    try {
      // Create order first
      const orderData = createOrderData();
      const order = await ordersApi.create(orderData);

      if (paymentMethod === 'Razorpay') {
        // Initiate Razorpay payment
        try {
          const razorpayOrder = await razorpayApi.createOrder(order._id);

          // Load Razorpay script if not already loaded
          if (!window.Razorpay) {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.async = true;
            document.body.appendChild(script);

            // Wait for script to load
            await new Promise((resolve, reject) => {
              script.onload = resolve;
              script.onerror = reject;
              setTimeout(reject, 10000); // 10 second timeout
            });
          }

          // Initialize Razorpay checkout
          const options = {
            key: razorpayOrder.key,
            amount: razorpayOrder.order.amount,
            currency: razorpayOrder.order.currency,
            name: 'FHAMMS',
            description: `${getDisplayOrderNumber(order._id)}`,
            order_id: razorpayOrder.order.id,
            prefill: {
              name: user.name || '',
              email: user.email || '',
              contact: order.shippingAddress?.phone || ''
            },
            notes: {
              orderId: order._id,
              address: `${order.shippingAddress?.address}, ${order.shippingAddress?.city}, ${order.shippingAddress?.postalCode}`
            },
            theme: {
              color: '#4caf50'
            },
            handler: async function (response) {
              try {
                // Verify payment
                await razorpayApi.verifyPayment({
                  order_id: response.razorpay_order_id,
                  payment_id: response.razorpay_payment_id,
                  signature: response.razorpay_signature
                });

                // Redirect to success
                redirectToSuccess(order);
              } catch (verifyError) {
                console.error('Payment verification failed:', verifyError);
                navigateToFailed(order._id, 'Payment verification failed. Please contact support if amount was debited.', order);
              }
            },
            modal: {
              ondismiss: function() {
                navigateToFailed(order._id, 'Payment was cancelled. Please try again.', order);
              }
            }
          };

          const razorpayInstance = new window.Razorpay(options);
          razorpayInstance.open();

        } catch (razorpayError) {
          console.error('Razorpay payment initiation error:', razorpayError);
          navigateToFailed(order._id, 'Failed to initiate Razorpay payment. Please try again.', order);
        }
      } else {
        // For other payment methods, redirect to success
        redirectToSuccess(order);
      }
    } catch (err) {
      navigateToFailed(null, err.response?.data?.message || 'Order placement/payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [validateForm, user, paymentMethod, createOrderData, redirectToSuccess, navigateToFailed]);


  // Redirect to login if not authenticated (double check even though PrivateRoute handles it)
  if (!user) {
    return (
      <div className="checkout">
        <Navbar />
        <div className="checkout__container">
          <div className="checkout__empty">
            <p className="checkout__empty-text">Please login to proceed with checkout</p>
            <button 
              onClick={() => navigate('/login')} 
              className="checkout__empty-button"
            >
              Go to Login
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

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
        <button
          onClick={() => navigate('/cart')}
          className="checkout__back-button"
        >
          ← Back to Cart
        </button>
        <h2 className="checkout__title">Checkout</h2>
        <div className="checkout__content">
          <div className="checkout__section">
            <h3 className="checkout__section-title">Shipping Address</h3>
            <form onSubmit={handleSubmit} className="checkout__form">
              <div className="checkout__field">
                <label className="checkout__label">Address <span className="checkout__label-required">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={e => setFormData({...formData, address: e.target.value})}
                  className="checkout__input"
                />
              </div>
              <div className="checkout__field">
                <label className="checkout__label">Pincode <span className="checkout__label-required">*</span></label>
                <input
                  type="text"
                  required
                  maxLength="6"
                  value={formData.postalCode}
                  onChange={e => {
                    const value = e.target.value.replace(/\D/g, ''); // Only numbers
                    setFormData({...formData, postalCode: value});
                    setPincodeError('');
                    setIsPincodeValid(false);
                    
                    // Validate and fetch city/state when 6 digits entered
                    if (value.length === 6) {
                      handlePincodeChange(value);
                    } else if (value.length < 6) {
                      // Clear city/state if pincode is incomplete
                      setFormData(prev => ({...prev, city: '', state: ''}));
                      setIsPincodeValid(false);
                    }
                  }}
                  className={`checkout__input ${pincodeError ? 'checkout__input--error' : ''}`}
                  placeholder="Enter 6-digit pincode"
                />
                {validatingPincode && (
                  <small className="checkout__pincode-loading">Validating pincode...</small>
                )}
                {pincodeError && (
                  <div className="checkout__pincode-error">{pincodeError}</div>
                )}
                {formData.postalCode.length === 6 && !pincodeError && !validatingPincode && formData.city && (
                  <small className="checkout__pincode-success">✓ City and State auto-filled</small>
                )}
              </div>
              <div className="checkout__field">
                <label className="checkout__label">City <span className="checkout__label-required">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={e => setFormData({...formData, city: e.target.value})}
                  className="checkout__input"
                  readOnly={formData.postalCode.length === 6 && formData.city ? true : false}
                  style={formData.postalCode.length === 6 && formData.city ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                />
                {formData.postalCode.length === 6 && formData.city && (
                  <small className="checkout__pincode-info">Auto-filled from pincode (you can edit if needed)</small>
                )}
              </div>
              <div className="checkout__field">
                <label className="checkout__label">State <span className="checkout__label-required">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={e => setFormData({...formData, state: e.target.value})}
                  className="checkout__input"
                  readOnly={formData.postalCode.length === 6 && formData.state ? true : false}
                  style={formData.postalCode.length === 6 && formData.state ? { backgroundColor: '#f0f0f0', cursor: 'not-allowed' } : {}}
                />
                {formData.postalCode.length === 6 && formData.state && (
                  <small className="checkout__pincode-info">Auto-filled from pincode (you can edit if needed)</small>
                )}
              </div>
              <div className="checkout__field">
                <label className="checkout__label">Country <span className="checkout__label-required">*</span></label>
                <input
                  type="text"
                  required
                  value={formData.country}
                  readOnly
                  className="checkout__input"
                  style={{ backgroundColor: '#f0f0f0', cursor: 'not-allowed' }}
                />
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Promo Code</label>
                {hasProductDiscount && !appliedPromoCode ? (
                  <div className="checkout__promo-warning">
                    ⚠️ Promo codes cannot be applied when products already have discounts. Please remove discounted items from cart to use promo code.
                  </div>
                ) : (
                  <div className="checkout__promo-input-group">
                    <input
                      type="text"
                      value={promoCode}
                      onChange={e => {
                        setPromoCode(e.target.value.toUpperCase());
                        setPromoCodeError('');
                        setPromoCodeSuccess('');
                      }}
                      placeholder="Enter promo code"
                      className="checkout__input checkout__promo-input"
                      disabled={!!appliedPromoCode || hasProductDiscount}
                    />
                    {!appliedPromoCode ? (
                      <button
                        type="button"
                        onClick={validatePromoCode}
                        disabled={validatingPromo || !promoCode.trim() || hasProductDiscount}
                        className="checkout__button"
                        style={{ 
                          padding: '10px 20px',
                          whiteSpace: 'nowrap',
                          minWidth: '100px'
                        }}
                      >
                        {validatingPromo ? 'Validating...' : 'Apply'}
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={removePromoCode}
                        className="checkout__empty-button"
                        style={{ 
                          padding: '10px 20px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                )}
                {promoCodeError && (
                  <div className="checkout__promo-error">
                    {promoCodeError}
                  </div>
                )}
                {promoCodeSuccess && (
                  <div className="checkout__promo-success">
                    ✓ {promoCodeSuccess}
                  </div>
                )}
              </div>

              <div className="checkout__field">
                <label className="checkout__label">Payment Method <span className="checkout__label-required">*</span></label>
                <div className="checkout__payment-methods">
                  <label className="checkout__radio">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Razorpay"
                      checked={paymentMethod === 'Razorpay'}
                      onChange={() => setPaymentMethod('Razorpay')}
                      required
                    />
                    Razorpay Gateway (UPI/Cards/Net Banking)
                    <img
                      src="https://cdn.worldvectorlogo.com/logos/razorpay.svg"
                      alt="Razorpay Logo"
                      width="38"
                      className="checkout__payment-logo"
                    />
                  </label>
                </div>
              </div>

              {error && <div className="checkout__error">{error}</div>}
              {!isPincodeValid && formData.postalCode.length === 6 && (
                <div className="checkout__pincode-warning">
                  ⚠️ Please wait for pincode validation to complete or enter a valid pincode.
                </div>
              )}
              {formData.postalCode.length > 0 && formData.postalCode.length < 6 && (
                <div className="checkout__pincode-warning">
                  ⚠️ Please enter a complete 6-digit pincode to continue.
                </div>
              )}
              <button 
                type="submit" 
                disabled={loading || !validateForm() || !isPincodeValid || validatingPincode} 
                className="checkout__button"
                title={!validateForm() || !isPincodeValid ? 'Please complete all required fields and validate pincode' : ''}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </form>
          </div>
          <div className="checkout__section">
            <h3 className="checkout__section-title">Order Summary</h3>
            {cartItems.map(item => (
              <div key={`${item._id}-${item.selectedWeight}`} className="checkout__summary-item" style={{alignItems:'center', display:'flex'}}>
                {(item.image || (item.product && item.product.image)) && (
                  <img src={item.image || (item.product && item.product.image)} alt={item.name} style={{width:48, height:48, objectFit:'cover', borderRadius:8, marginRight:12}} />
                )}
                <div style={{flex:1}}>
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
            <div className="checkout__summary-row checkout__summary-row-border">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="checkout__summary-row checkout__summary-row-discount">
                <span>Discount {appliedPromoCode && `(${appliedPromoCode})`}</span>
                <span>-₹{discount.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout__summary-row">
              <span>
                Delivery Charge
                {loadingDeliveryCharge && <small className="checkout__loading-text"> (calculating...)</small>}
              </span>
              <span>
                {loadingDeliveryCharge ? '...' : `₹${deliveryCharge.toFixed(2)}`}
              </span>
            </div>
            <div className="checkout__summary-total">
              Total: ₹{total.toFixed(2)}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default Checkout;
