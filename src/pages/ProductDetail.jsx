import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { API_URL } from '../config/api.js';
import '../styles/pages/product-detail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProduct() {
      if (!id) {
        setError('Invalid product ID');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const { data } = await axios.get(`${API_URL}/api/products/${id}`);
        if (data) {
          setProduct(data);
          // Set default weight option (first one or 250g)
          if (data.weightOptions && data.weightOptions.length > 0) {
            const defaultWeight = data.weightOptions.find(w => w.weight === 250) || data.weightOptions[0];
            setSelectedWeight(defaultWeight);
          }
        } else {
          setError('Product not found');
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(err.response?.status === 404 ? 'Product not found' : err.response?.data?.message || 'Failed to load product');
      }
      setLoading(false);
    }
    fetchProduct();
  }, [id]);

  const handleWeightChange = (weightOption) => {
    setSelectedWeight(weightOption);
    setQty(1); // Reset quantity when weight changes
  };

  const handleAddToCart = () => {
    if (!selectedWeight) {
      alert('Please select a weight option');
      return;
    }
    const productWithWeight = {
      ...product,
      price: selectedWeight.price,
      selectedWeight: selectedWeight.weight,
      weightOption: selectedWeight
    };
    addToCart(productWithWeight, qty);
    navigate('/cart');
  };

  if (loading) return (
    <div>
      <Navbar />
      <div className="product-detail__loading">
        <div className="product-detail__loading-icon">⏳</div>
        <p className="product-detail__loading-text">Loading product...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div>
      <Navbar />
      <div className="product-detail__error">
        <div className="product-detail__error-icon">❌</div>
        <p className="product-detail__error-text">{error}</p>
      </div>
    </div>
  );
  
  if (!product) return null;

  const currentPrice = selectedWeight ? selectedWeight.price : (product.price || product.basePrice);
  const currentStock = selectedWeight ? selectedWeight.stock : product.stock;

  return (
    <div className="product-detail">
      <Navbar />
      <div className="product-detail__container">
        <div className="product-detail__content">
          <div className="product-detail__image-wrapper">
            {product.image ? (
              <img
                src={product.image}
                alt={product.name}
                className="product-detail__image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  if (e.target.nextSibling) {
                    e.target.nextSibling.style.display = 'flex';
                  }
                }}
              />
            ) : null}
            <div className="product-detail__image-placeholder" style={{ display: product.image ? 'none' : 'flex' }}>
              🍪
            </div>
          </div>
          <div className="product-detail__info">
            {product.category && (
              <span className="product-detail__category">{product.category}</span>
            )}
            <h1 className="product-detail__name">{product.name}</h1>
            <p className="product-detail__price">₹{currentPrice}</p>
            <div className="product-detail__description">
              <h3 className="product-detail__description-title">Description</h3>
              <p className="product-detail__description-text">{product.description}</p>
            </div>
            
            {/* Weight Selection */}
            {product.weightOptions && product.weightOptions.length > 0 && (
              <div className="product-detail__weight-selection">
                <label className="product-detail__weight-label">Select Weight:</label>
                <div className="product-detail__weight-options">
                  {product.weightOptions.map((weightOpt, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleWeightChange(weightOpt)}
                      className={`product-detail__weight-option ${selectedWeight?.weight === weightOpt.weight ? 'product-detail__weight-option--active' : ''}`}
                    >
                      <div className="product-detail__weight-option-weight">{weightOpt.weight}g</div>
                      <div className="product-detail__weight-option-price">₹{weightOpt.price}</div>
                      {weightOpt.stock <= 10 && weightOpt.stock > 0 && (
                        <div className="product-detail__weight-option-stock">Only {weightOpt.stock} left!</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="product-detail__quantity">
              <label className="product-detail__quantity-label">Quantity:</label>
              <div className="product-detail__quantity-controls">
                <input
                  type="number"
                  min={1}
                  max={currentStock || 99}
                  value={qty}
                  onChange={e => setQty(Number(e.target.value))}
                  className="product-detail__quantity-input"
                />
                <span className="product-detail__stock">
                  {currentStock ? `${currentStock} in stock` : 'Available'}
                </span>
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="product-detail__button"
              disabled={!selectedWeight && product.weightOptions?.length > 0}
            >
              🛒 Add to Cart
            </button>
            {selectedWeight && (
              <div className="product-detail__total-preview">
                Total: ₹{(currentPrice * qty).toFixed(2)} ({qty} × {selectedWeight.weight}g)
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default ProductDetail;
