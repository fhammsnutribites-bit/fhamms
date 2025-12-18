import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import PriceDisplay from '../components/PriceDisplay.jsx';
import Loader from '../components/Loader.jsx';
import '../styles/pages/cart.css';

function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    clearCart,
    subtotal,
    deliveryCharge,
    loadingDeliveryCharge,
    total,
    error,
    loading,
    updatingQuantity,
    removingFromCart,
    clearingCart,
    isAnyLoading
  } = useCart();
  const navigate = useNavigate();

  return (
    <div className="cart">
      <Navbar />
      <div className="cart__container">
        <button
          onClick={() => navigate('/products')}
          className="cart__back-button"
        >
          ← Back to Shopping
        </button>
        <h1 className="cart__title">🛒 Your Shopping Cart</h1>

        {error && (
          <div className="cart__error">
            <div className="cart__error-icon">⚠️</div>
            <p className="cart__error-message">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="cart__error-retry"
            >
              Retry
            </button>
          </div>
        )}
        {cartItems.length === 0 ? (
          <div className="cart__empty">
            <div className="cart__empty-icon">🛒</div>
            <p className="cart__empty-text">Your cart is empty</p>
            <Link to="/products" className="cart__empty-button">
              🛍️ Go Shopping
            </Link>
          </div>
        ) : (
          <div className="cart__content">
            <div className="cart__items">
              {cartItems.map((item, idx) => {
                const uniqueKey = item.selectedWeight 
                  ? `${item._id}-${item.selectedWeight}` 
                  : `${item._id}-${idx}`;
                return (
                <div key={uniqueKey} className="cart__item">
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="cart__item-image"
                    />
                  )}
                  <div className="cart__item-info">
                    <Link to={`/products/${item._id}`} className="cart__item-link">
                      {item.name}
                    </Link>
                    {item.selectedWeight && (
                      <div className="cart__item-weight">
                        Weight: {item.selectedWeight}g
                      </div>
                    )}
                    <div className="cart__item-price">
                      <PriceDisplay
                        originalPrice={item.originalPrice || item.price}
                        discountedPrice={item.originalPrice && item.originalPrice !== item.price ? item.price : null}
                        discountInfo={item.originalPrice && item.originalPrice !== item.price ? { type: 'fixed', value: item.originalPrice - item.price } : null}
                        hasDiscount={item.originalPrice && item.originalPrice !== item.price}
                        size="small"
                        showBadge={false}
                      />
                    </div>
                    <div className="cart__item-controls">
                      <div className="cart__item-quantity">
                        <button
                          onClick={() => {
                            updateQuantity(item.cartItemId, Math.max(1, item.qty - 1));
                          }}
                          className="cart__item-quantity-button"
                          disabled={updatingQuantity}
                        >
                          {updatingQuantity ? '...' : '−'}
                        </button>
                        <span className="cart__item-quantity-value">{item.qty}</span>
                        <button
                          onClick={() => {
                            updateQuantity(item.cartItemId, item.qty + 1);
                          }}
                          className="cart__item-quantity-button"
                          disabled={updatingQuantity}
                        >
                          {updatingQuantity ? '...' : '+'}
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          removeFromCart(item.cartItemId);
                        }}
                        className="cart__item-remove"
                        disabled={removingFromCart}
                      >
                        {removingFromCart ? 'Removing...' : 'Remove'}
                      </button>
                    </div>
                  </div>
                  <div className="cart__item-total">
                    ₹{((item.qty || 0) * (item.price || 0)).toFixed(2)}
                  </div>
                </div>
                );
              })}
            </div>
            <div className="cart__summary">
              <h2 className="cart__summary-title">Order Summary</h2>
              <div className="cart__summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="cart__summary-row">
                <span>
                  Delivery Charge
                  {loadingDeliveryCharge && <small className="cart__loading-text"> (calculating...)</small>}
                </span>
                <span>
                  {loadingDeliveryCharge ? '...' : `₹${deliveryCharge.toFixed(2)}`}
                </span>
              </div>
              <div className="cart__summary-row cart__summary-row--total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
              <button
                onClick={() => navigate('/checkout')}
                className="cart__summary-button"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={clearCart}
                className="cart__summary-button cart__summary-button--secondary"
                disabled={clearingCart}
              >
                {clearingCart ? 'Clearing...' : 'Clear Cart'}
              </button>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
export default Cart;
