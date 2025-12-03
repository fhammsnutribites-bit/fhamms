import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { API_URL } from '../config/api.js';
import '../styles/pages/products.css';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
      } catch (err) {
        setError('Failed to load products');
      }
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) return (
    <div>
      <Navbar />
      <div className="products__loading">
        <div className="products__loading-icon">⏳</div>
        <p className="products__loading-text">Loading products...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div>
      <Navbar />
      <div className="products__error">
        <div className="products__error-icon">❌</div>
        <p className="products__error-text">{error}</p>
      </div>
    </div>
  );

  return (
    <div className="products">
      <Navbar />
      <div className="products__container">
        <div className="products__header">
          <h1 className="products__title">Our Premium Laddus</h1>
          <p className="products__subtitle">Discover our handcrafted collection of traditional and healthy laddus</p>
        </div>

        <div className="products__search">
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search for products..."
            className="products__search-input"
          />
          <span className="products__search-icon">🔍</span>
        </div>

        {categories.length > 1 && (
          <div className="products__categories">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`products__category-button ${selectedCategory === cat ? 'products__category-button--active' : ''}`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        <div className="products__grid">
          {filteredProducts.map(prod => (
            <div key={prod._id} className="products__card">
              <Link to={`/products/${prod._id}`} className="products__card-link">
                {prod.image && (
                  <div className="products__card-image" style={{ backgroundImage: `url(${prod.image})` }} />
                )}
                <div className="products__card-content">
                  {prod.category && (
                    <span className="products__card-category">{prod.category}</span>
                  )}
                  <h3 className="products__card-name">{prod.name}</h3>
                  <div className="products__card-rating">
                    <div style={{ display: 'flex', gap: '2px' }}>
                      {[1,2,3,4,5].map(() => (
                        <span key={Math.random()} style={{ color: '#ffc107', fontSize: '14px' }}>★</span>
                      ))}
                    </div>
                    <span style={{ fontSize: '12px', color: '#666' }}>
                      ({Math.floor(Math.random() * 200 + 50)})
                    </span>
                  </div>
                  <p className="products__card-price">₹{prod.price || prod.basePrice}</p>
                </div>
              </Link>
              <div className="products__card-actions">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart(prod, 1);
                    navigate('/cart');
                  }}
                  className="products__card-button"
                >
                  🛒 Add to Cart
                </button>
              </div>
            </div>
          ))}
        </div>
        {filteredProducts.length === 0 && (
          <div className="products__empty">
            <p className="products__empty-text">No products found in this category</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
export default Products;
