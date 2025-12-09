import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import { getProductPriceInfo } from '../utils/discount.js';
import SEO from '../SEO.jsx';
import { productsApi } from '../services/productsApi.js';
import { useCart } from '../context/CartContext.jsx';
import '../styles/pages/home.css';
import '../styles/components/reviews-section.css';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const { addToCart } = useCart();

  const categoryIcons = useMemo(() => ['🍪', '🥜', '🌰', '🍯', '🌾', '🥥'], []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsApi.getAll();
      setProducts(data);
      
      // Extract unique categories
      const uniqueCategories = [...new Set(data.map(p => p.category).filter(Boolean))];
      setCategories(uniqueCategories.slice(0, 6));
    } catch (err) {
      console.error('Failed to load products:', err);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const trendingProducts = useMemo(() => products.slice(0, 4), [products]);

  const handleAddToCart = useCallback((product, event) => {
    event.preventDefault();
    event.stopPropagation();

    // Calculate proper price and original price for discount detection
    const priceInfo = getProductPriceInfo(product);
    const finalPrice = priceInfo ? (priceInfo.hasDiscount ? priceInfo.discounted : priceInfo.original) : product.price;

    const productWithPrice = {
      ...product,
      price: finalPrice,
      originalPrice: priceInfo ? priceInfo.original : product.price
    };

    addToCart(productWithPrice, 1);
    navigate('/cart');
  }, [addToCart, navigate]);

  return (
    <div className="home">
      <SEO 
        title="Dry Fruit Laddus Online | Premium Nutri Laddus | FHAMMS Nutri Bites"
        description="Buy premium dry fruit laddus online at FHAMMS Nutri Bites. Handmade dry fruit laddus with almonds, cashews, dates & jaggery. Best dry fruit laddus in India. Order now for healthy & delicious laddus."
        keywords="dry fruit laddus, dry fruit laddu, dry fruit laddus online, buy dry fruit laddus, premium dry fruit laddus, dry fruit laddus price, best dry fruit laddus, dry fruit laddus near me, homemade dry fruit laddus, healthy dry fruit laddus, nutri laddus"
      />
      <Navbar />
      
      {/* Hero Section */}
      <div className="home__hero">
        <div className="home__hero-container">
          <div>
            <div className="home__hero-badge">
              ⭐ 5.0 Rated Premium Dry Fruit Laddus
            </div>
            <h1 className="home__hero-title">
              <span className="home__hero-title--highlight">Premium Dry Fruit Laddus</span>
              <span className="home__hero-title--dark">Healthy & Delicious</span>
            </h1>
            <p className="home__hero-description">
              Buy the best dry fruit laddus online! Our premium dry fruit laddus are handcrafted with almonds, cashews, dates, and jaggery. Order authentic dry fruit laddus made with pure ingredients - perfect for health, energy, and taste. Get fresh dry fruit laddus delivered to your doorstep!
            </p>
            <div className="home__hero-actions">
              <Link to="/products" className="home__hero-button">
                Buy Dry Fruit Laddus →
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
          <div className="home__hero-image-wrapper">
            <div className="home__hero-image-container">
              {products[0]?.image ? (
                <img
                  src={products[0].image}
                  alt="Featured Laddu"
                  className="home__hero-image"
                />
              ) : (
                <div className="home__hero-image-placeholder">
                  🍪
                </div>
              )}
              <div className="home__hero-bestseller-badge">
                <span className="home__hero-bestseller-icon">🔥</span>
                <span className="home__hero-bestseller-text">
                  Best Seller
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Shop by Category Section */}
      <div className="home__section">
        <div className="home__section-header">
          <h2 className="home__section-title">
            Shop Premium Dry Fruit Laddus by Category
          </h2>
          <p className="home__section-subtitle">
            Explore our wide variety of premium dry fruit laddus - from traditional recipes to modern healthy variants. Buy the best dry fruit laddus online!
          </p>
        </div>
        <div className="home__categories">
          {categories.length > 0 ? categories.map((category, idx) => (
            <Link
              key={idx}
              to="/products"
              className="home__product-link"
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
                className="home__product-link"
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
        <div className="home__trending-section">
          <div className="home__trending-container">
            <div className="home__trending-header">
              <div className="home__trending-title-section">
                <h2 className="home__trending-title">
                  Best Selling Dry Fruit Laddus
                </h2>
                <p className="home__trending-subtitle">
                  Our most popular dry fruit laddus - handcrafted with premium ingredients
                </p>
              </div>
              <Link to="/products" className="home__trending-link">
                View All Dry Fruit Laddus →
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
                  <Link to={`/products/${prod._id}`} className="home__product-link">
                    {prod.image && (
                      <div className="home__product-image" style={{ backgroundImage: `url(${prod.image})` }} />
                    )}
                    <div className="home__product-content">
                      {prod.category && (
                        <span className="home__product-category">{prod.category}</span>
                      )}
                      <h3 className="home__product-name">{prod.name}</h3>
                      <RatingDisplay
                        rating={prod.averageRating || 0}
                        reviewCount={prod.reviewCount || 0}
                        size="small"
                      />
                      <p className="home__product-price">₹{prod.price || prod.basePrice}</p>
                    </div>
                  </Link>
                  <div className="home__product-actions">
                    <button
                      onClick={(e) => handleAddToCart(prod, e)}
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

      <ReviewsSection />

      <Footer />
    </div>
  );
}
export default Home;
