import { useCart } from '../context/CartContext.jsx';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import '../styles/pages/cart.css';

function Cart() {
  const { cartItems, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();
  const total = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="cart">
      <Navbar />
      <div className="cart__container">
        <h1 className="cart__title">🛒 Your Shopping Cart</h1>
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
                    <div className="cart__item-price">₹{item.price?.toFixed(2) || '0.00'}</div>
                    <div className="cart__item-controls">
                      <div className="cart__item-quantity">
                        <button
                          onClick={() => {
                            const updatePayload = item.selectedWeight 
                              ? { _id: item._id, selectedWeight: item.selectedWeight, qty: Math.max(1, item.qty - 1) }
                              : { _id: item._id, qty: Math.max(1, item.qty - 1) };
                            updateQuantity(updatePayload._id, updatePayload.qty, updatePayload.selectedWeight);
                          }}
                          className="cart__item-quantity-button"
                        >
                          −
                        </button>
                        <span className="cart__item-quantity-value">{item.qty}</span>
                        <button
                          onClick={() => {
                            const updatePayload = item.selectedWeight 
                              ? { _id: item._id, selectedWeight: item.selectedWeight, qty: item.qty + 1 }
                              : { _id: item._id, qty: item.qty + 1 };
                            updateQuantity(updatePayload._id, updatePayload.qty, updatePayload.selectedWeight);
                          }}
                          className="cart__item-quantity-button"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => {
                          const removePayload = item.selectedWeight 
                            ? { _id: item._id, selectedWeight: item.selectedWeight }
                            : item._id;
                          removeFromCart(removePayload);
                        }}
                        className="cart__item-remove"
                      >
                        Remove
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
                <span>₹{total.toFixed(2)}</span>
              </div>
              <div className="cart__summary-row">
                <span>Shipping</span>
                <span>Free</span>
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
              >
                Clear Cart
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
