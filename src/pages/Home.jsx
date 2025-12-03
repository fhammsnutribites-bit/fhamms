import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { API_URL } from '../config/api.js';
import { useCart } from '../context/CartContext.jsx';
import '../styles/pages/home.css';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data } = await axios.get(`${API_URL}/api/products`);
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
        setCategories(uniqueCategories.slice(0, 6));
      } catch (err) {
        console.error('Failed to load products');
      }
    }
    fetchProducts();
  }, []);

  const trendingProducts = products.slice(0, 4);
  const categoryIcons = ['🍪', '🥜', '🌰', '🍯', '🌾', '🥥'];

  return (
    <div className="home">
      <Navbar />
      
      {/* Hero Section */}
      <div className="home__hero">
        <div className="home__hero-container">
          <div>
            <div className="home__hero-badge">
              ⭐ 5.0 Rated Premium Laddus
            </div>
            <h1 className="home__hero-title">
              <span className="home__hero-title--highlight">NutriBites Laddus</span>
              <span className="home__hero-title--dark">Healthy & Delicious</span>
            </h1>
            <p className="home__hero-description">
              Discover our handcrafted collection of traditional and healthy laddus made with pure ingredients, premium dry fruits, and authentic recipes. Taste the goodness in every bite!
            </p>
            <div className="home__hero-actions">
              <Link to="/products" className="home__hero-button">
                Shop Laddus →
              </Link>
              <button className="home__hero-button home__hero-button--secondary">
                ▶ Our Story
              </button>
            </div>
            <div className="home__hero-features">
              {['100% Natural', 'Handcrafted', 'No Preservatives'].map((feature, idx) => (
                <div key={idx} className="home__hero-feature">
                  <span className="home__hero-feature-icon">✓</span>
                  <span className="home__hero-feature-text">{feature}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
              position: 'relative'
            }}>
              {products[0]?.image ? (
                <img
                  src={products[0].image}
                  alt="Featured Laddu"
                  className="home__hero-image"
                  style={{ height: '450px' }}
                />
              ) : (
                <div style={{
                  width: '100%',
                  height: '450px',
                  background: 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '120px'
                }}>
                  🍪
                </div>
              )}
              <div style={{
                position: 'absolute',
                bottom: '30px',
                left: '30px',
                background: 'white',
                padding: '12px 20px',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                border: '2px solid #ff9800'
              }}>
                <span style={{ fontSize: '24px' }}>🔥</span>
                <span style={{ fontWeight: 'bold', color: '#333' }}>
                  Best Seller
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className="home__section">
        <div style={{ textAlign: 'center', marginBottom: '50px' }}>
          <h2 className="home__section-title">
            Shop by Category
          </h2>
          <p style={{
            fontSize: '18px',
            color: '#666',
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            Explore our wide variety of traditional and healthy laddus
          </p>
        </div>
        <div className="home__categories">
          {categories.length > 0 ? categories.map((category, idx) => (
            <Link
              key={idx}
              to="/products"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div className="home__category-card">
                <div className="home__category-icon">
                  {categoryIcons[idx] || '🍪'}
                </div>
                <h3 className="home__category-name">{category}</h3>
              </div>
            </Link>
          )) : (
            ['Traditional Laddus', 'Healthy Laddus', 'Premium Laddus', 'Fusion Laddus', 'Sugar-Free', 'Festive Special'].map((cat, idx) => (
              <Link
                key={idx}
                to="/products"
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="home__category-card">
                  <div className="home__category-icon">
                    {categoryIcons[idx] || '🍪'}
                  </div>
                  <h3 className="home__category-name">{cat}</h3>
                </div>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Trending Now Section */}
      {trendingProducts.length > 0 && (
        <div style={{ background: '#f8f9fa', padding: '80px 40px' }}>
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '40px',
              flexWrap: 'wrap',
              gap: '20px'
            }}>
              <div>
                <h2 style={{
                  fontSize: '36px',
                  fontWeight: 'bold',
                  color: '#1b5e20',
                  marginBottom: '10px'
                }}>
                  Trending Laddus
                </h2>
                <p style={{ fontSize: '16px', color: '#666' }}>
                  Our most popular laddus this week
                </p>
              </div>
              <Link to="/products" style={{
                color: '#4caf50',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseEnter={(e) => e.target.style.gap = '12px'}
              onMouseLeave={(e) => e.target.style.gap = '8px'}
              >
                View All Laddus →
              </Link>
            </div>
            <div className="home__products-grid">
              {trendingProducts.map((prod, idx) => (
                <div key={prod._id} className="home__product-card">
                  {idx === 0 && (
                    <div className="home__product-badge">
                      BESTSELLER
                    </div>
                  )}
                  <Link to={`/products/${prod._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    {prod.image && (
                      <div className="home__product-image" style={{ backgroundImage: `url(${prod.image})` }} />
                    )}
                    <div className="home__product-content">
                      {prod.category && (
                        <span className="home__product-category">{prod.category}</span>
                      )}
                      <h3 className="home__product-name">{prod.name}</h3>
                      <div className="home__product-rating">
                        <div style={{ display: 'flex', gap: '2px' }}>
                          {[1,2,3,4,5].map(() => (
                            <span key={Math.random()} style={{ color: '#ffc107', fontSize: '16px' }}>★</span>
                          ))}
                        </div>
                        <span style={{ fontSize: '14px', color: '#666' }}>
                          ({Math.floor(Math.random() * 200 + 50)} reviews)
                        </span>
                      </div>
                      <p className="home__product-price">₹{prod.price || prod.basePrice}</p>
                    </div>
                  </Link>
                  <div style={{ padding: '0 20px 20px' }}>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(prod, 1);
                        navigate('/cart');
                      }}
                      className="home__product-button"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Newsletter Section */}
      <div className="home__newsletter">
        <div className="home__newsletter-container">
          <h2 className="home__newsletter-title">
            Join the NutriBites Family
          </h2>
          <p className="home__newsletter-description">
            Subscribe to our newsletter for exclusive offers, new laddu flavors, healthy recipes, and special discounts delivered to your inbox.
          </p>
          <div className="home__newsletter-form">
            <input
              type="email"
              placeholder="Enter your email address"
              className="home__newsletter-input"
            />
            <button className="home__newsletter-button">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
export default Home;
