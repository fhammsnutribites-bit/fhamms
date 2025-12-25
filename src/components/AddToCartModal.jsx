import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBestWeightOption, getProductPriceInfo } from '../utils/discount.js';
import '../styles/components/add-to-cart-modal.css';

function AddToCartModal({ isOpen, onClose, product, onAddToCart }) {
  const navigate = useNavigate();
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [addedProducts, setAddedProducts] = useState([]);
  const [quantities, setQuantities] = useState({});

  // Get available weight options
  const weightOptions = product ? product.weightOptions || [] : [];
  const hasWeightOptions = product ? weightOptions.length > 0 : false;

  // If no weight options, use default (base price)
  const defaultWeight = product && !hasWeightOptions ? { weight: 250, price: product.basePrice || product.price } : null;

  // Reset modal state when it opens
  React.useEffect(() => {
    if (isOpen && product) {
      setSelectedWeight(null);
      setShowSuccess(false);
      setAddedProducts([]);
      setQuantities({});
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const handleQuantityChange = (weight, quantity) => {
    setQuantities(prev => ({
      ...prev,
      [weight]: Math.max(0, parseInt(quantity) || 0)
    }));
  };

  const handleAddToCart = async () => {
    const itemsToAdd = [];

    if (hasWeightOptions) {
      weightOptions.forEach(option => {
        const quantity = quantities[option.weight] || 0;
        if (quantity > 0) {
          const priceInfo = getProductPriceInfo(product, option);
          const finalPrice = priceInfo ? (priceInfo.hasDiscount ? priceInfo.discounted : priceInfo.original) : option.price;
          itemsToAdd.push({
            ...product,
            selectedWeight: option.weight,
            price: finalPrice,
            originalPrice: priceInfo ? priceInfo.original : option.price,
            quantity
          });
        }
      });
    } else {
      const quantity = quantities[defaultWeight.weight] || 0;
      if (quantity > 0) {
        const priceInfo = getProductPriceInfo(product, defaultWeight);
        const finalPrice = priceInfo ? (priceInfo.hasDiscount ? priceInfo.discounted : priceInfo.original) : defaultWeight.price;
        itemsToAdd.push({
          ...product,
          selectedWeight: defaultWeight.weight,
          price: finalPrice,
          originalPrice: priceInfo ? priceInfo.original : defaultWeight.price,
          quantity
        });
      }
    }

    try {
      for (const item of itemsToAdd) {
        await onAddToCart(item, item.quantity);
      }
      setAddedProducts(itemsToAdd);
      setShowSuccess(true);
    } catch (error) {
      console.error('Failed to add items to cart:', error);
      onClose();
    }
  };

  const handleContinueShopping = () => {
    onClose();
  };

  const handleGoToCart = () => {
    onClose();
    navigate('/cart');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Show modal
  return (
    <div className="add-to-cart-modal-backdrop" onClick={handleBackdropClick}>
      <div className="add-to-cart-modal">
        {showSuccess ? (
          <>
            <div className="add-to-cart-modal__icon">✅</div>
            <h2 className="add-to-cart-modal__title">Added to Cart!</h2>

            <div className="add-to-cart-modal__products">
              {addedProducts.map((product, index) => (
                <div key={index} className="add-to-cart-modal__product">
                  <div className="add-to-cart-modal__product-image">
                    {product?.image ? (
                      <img src={product.image} alt={product.name} />
                    ) : (
                      <div className="add-to-cart-modal__placeholder">📦</div>
                    )}
                  </div>
                  <div className="add-to-cart-modal__product-info">
                    <h3 className="add-to-cart-modal__product-name">{product?.name}</h3>
                    <div className="add-to-cart-modal__product-details">
                      <span className="add-to-cart-modal__weight-selected">
                        {product?.selectedWeight}g × {product?.quantity}
                      </span>
                      <span className="add-to-cart-modal__price">
                        ₹{(product?.price * product?.quantity)?.toFixed(2)}
                        {product?.originalPrice && product.originalPrice > product.price && (
                          <span className="add-to-cart-modal__original-price">
                            ₹{(product.originalPrice * product.quantity).toFixed(2)}
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="add-to-cart-modal__message">
              {addedProducts.length === 1 ? 'Item has been added to your cart successfully!' : 'Items have been added to your cart successfully!'}
            </p>

            <div className="add-to-cart-modal__actions">
              <button
                className="add-to-cart-modal__continue"
                onClick={handleContinueShopping}
              >
                Continue Shopping
              </button>
              <button
                className="add-to-cart-modal__cart"
                onClick={handleGoToCart}
              >
                Go to Cart
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="add-to-cart-modal__icon">⚖️</div>
            <h2 className="add-to-cart-modal__title">Select Weight</h2>

            <div className="add-to-cart-modal__product">
              <div className="add-to-cart-modal__product-image">
                {product?.image ? (
                  <img src={product.image} alt={product.name} />
                ) : (
                  <div className="add-to-cart-modal__placeholder">📦</div>
                )}
              </div>
              <div className="add-to-cart-modal__product-info">
                <h3 className="add-to-cart-modal__product-name">{product?.name}</h3>
                <p className="add-to-cart-modal__product-description">
                  Choose your preferred weight option
                </p>
              </div>
            </div>

            <div className="add-to-cart-modal__weight-options">
              {hasWeightOptions ? (
                weightOptions.map((option, index) => (
                  <div key={index} className="add-to-cart-modal__weight-option">
                    <div className="add-to-cart-modal__weight-info">
                      <span className="add-to-cart-modal__weight">{option.weight}g</span>
                      <span className="add-to-cart-modal__price">₹{option.price}</span>
                      {option.stock !== undefined && option.stock <= 5 && (
                        <span className="add-to-cart-modal__stock">Only {option.stock} left</span>
                      )}
                    </div>
                    <div className="add-to-cart-modal__quantity-controls">
                      <button
                        className="add-to-cart-modal__quantity-btn"
                        onClick={() => handleQuantityChange(option.weight, (quantities[option.weight] || 0) - 1)}
                        disabled={(quantities[option.weight] || 0) <= 0}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        min="0"
                        value={quantities[option.weight] || 0}
                        onChange={(e) => handleQuantityChange(option.weight, e.target.value)}
                        className="add-to-cart-modal__quantity-input"
                      />
                      <button
                        className="add-to-cart-modal__quantity-btn"
                        onClick={() => handleQuantityChange(option.weight, (quantities[option.weight] || 0) + 1)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="add-to-cart-modal__weight-option">
                  <div className="add-to-cart-modal__weight-info">
                    <span className="add-to-cart-modal__weight">250g</span>
                    <span className="add-to-cart-modal__price">₹{defaultWeight.price}</span>
                  </div>
                  <div className="add-to-cart-modal__quantity-controls">
                    <button
                      className="add-to-cart-modal__quantity-btn"
                      onClick={() => handleQuantityChange(defaultWeight.weight, (quantities[defaultWeight.weight] || 0) - 1)}
                      disabled={(quantities[defaultWeight.weight] || 0) <= 0}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="0"
                      value={quantities[defaultWeight.weight] || 0}
                      onChange={(e) => handleQuantityChange(defaultWeight.weight, e.target.value)}
                      className="add-to-cart-modal__quantity-input"
                    />
                    <button
                      className="add-to-cart-modal__quantity-btn"
                      onClick={() => handleQuantityChange(defaultWeight.weight, (quantities[defaultWeight.weight] || 0) + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="add-to-cart-modal__add-btn"
              onClick={handleAddToCart}
            >
              Add to Cart
            </button>

            <button
              className="add-to-cart-modal__cancel"
              onClick={onClose}
            >
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default AddToCartModal;
