import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AddToCartModal from '../components/AddToCartModal.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import { getProductPriceInfo } from '../utils/discount.js';
import SEO from '../SEO.jsx';
import { productsApi } from '../services/productsApi.js';
import { categoriesApi } from '../services/categoriesApi.js';
import { notificationsApi } from '../services/notificationsApi.js';
import { statisticsApi } from '../services/statisticsApi.js';
import { useCart } from '../context/CartContext.jsx';
import Loader from '../components/Loader.jsx';
import '../styles/pages/home.css';
import '../styles/components/reviews-section.css';

function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showCartModal, setShowCartModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [statistics, setStatistics] = useState({
    totalCustomers: 25000,
    totalProducts: 85,
    averageRating: 4.9,
    totalOrders: 15000
  });
  const { addToCart, isAnyLoading } = useCart();
  const [loading, setLoading] = useState(false);

  // Loader logic at the top level - only show for page data loading, not cart operations
  if (loading) {
    return <Loader fullPage />;
  }

  // Defensive: Always ensure arrays/objects for UI
  const safeProducts = Array.isArray(products) ? products : [];
  const safeCategories = Array.isArray(categories) ? categories : [];
  const safeNotifications = Array.isArray(notifications) ? notifications : [];
  const safeStatistics = statistics && typeof statistics === 'object' ? statistics : { totalCustomers: 0, totalProducts: 0, averageRating: 0, totalOrders: 0 };

  const categoryIcons = useMemo(() => ['🍪', '🥜', '🌰', '🍯', '🌾', '🥥'], []);

  // Fallback notification messages (used if API fails or no notifications exist)
  const fallbackMessages = [
    {
      text: "Free delivery on orders above ₹500 • Same day delivery in Delhi NCR • 100% authentic dry fruit laddus",
      icon: "🚚",
      accentIcon: "⭐"
    },
    {
      text: "Premium handcrafted laddus • Made with almonds, cashews & pure jaggery • Healthy & delicious",
      icon: "🏆",
      accentIcon: "🥜"
    },
    {
      text: "Order fresh daily • No preservatives • Traditional recipes with modern health benefits",
      icon: "🌟",
      accentIcon: "🍯"
    },
    {
      text: "Trusted by 10,000+ customers • 4.9 star rating • Best dry fruit laddus online",
      icon: "💎",
      accentIcon: "🏅"
    }
  ];

  useEffect(() => {
    let isMounted = true;
    
    // Set loading to false immediately to show the page
    setLoading(false);
    
    // Load data in background
    async function fetchAllData() {
      try {
        await Promise.allSettled([
          fetchCategories(),
          fetchNotifications(),
          fetchProducts(),
          fetchStatistics()
        ]);
      } catch (err) {
        console.log('Home: Some data failed to load, but page will show with fallbacks');
      }
    }
    
    fetchAllData();
    
    return () => { 
      isMounted = false; 
    };
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const data = await categoriesApi.getAll();
      console.log('Categories API response:', data);
      setCategories(Array.isArray(data) ? data.slice(0, 6) : []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await notificationsApi.getActive();
      console.log('Notifications API response:', data);
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
      setNotifications([]);
    }
  }, []);

  const fetchProducts = useCallback(async () => {
    try {
      const data = await productsApi.getAll();
      console.log('Products API response:', data);
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load products:', err);
      setProducts([]);
    }
  }, []);

  const fetchStatistics = useCallback(async () => {
    try {
      const data = await statisticsApi.getDashboardStats();
      console.log('Statistics API response:', data);
      setStatistics(data && typeof data === 'object' ? data : { totalCustomers: 0, totalProducts: 0, averageRating: 0, totalOrders: 0 });
    } catch (err) {
      console.error('Failed to load statistics:', err);
      setStatistics({ totalCustomers: 0, totalProducts: 0, averageRating: 0, totalOrders: 0 });
    }
  }, []);

  // Notification messages fallback if API fails
  const notificationMessages = useMemo(() => safeNotifications.length > 0 ? safeNotifications : fallbackMessages, [safeNotifications, fallbackMessages]);

  // Filter products with price, then sort bestsellers first, then take first 4
  const trendingProducts = useMemo(() => {
    // Filter products to only include those with a price
    const pricedProducts = safeProducts.filter(product =>
      product && product.price !== undefined &&
      product.price !== null &&
      product.price > 0
    );

    const sortedProducts = [...pricedProducts].sort((a, b) => {
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
    return sortedProducts.slice(0, 4);
  }, [safeProducts]);

  // Get products for hero banner animation
  const heroProducts = useMemo(() => {
    return safeProducts.filter(p =>
      p && p.price !== undefined &&
      p.price !== null &&
      p.price > 0 &&
      p.image
    ).slice(0, 5); // Get first 5 products with images
  }, [safeProducts]);

  // Memoize displayed categories to prevent unnecessary re-renders
  const displayedCategories = useMemo(() => {
    return safeCategories.length > 0 ? safeCategories : [
      { name: 'Traditional Laddus', image: '' },
      { name: 'Healthy Laddus', image: '' },
      { name: 'Premium Laddus', image: '' },
      { name: 'Fusion Laddus', image: '' },
      { name: 'Sugar-Free', image: '' },
      { name: 'Festive Special', image: '' }
    ];
  }, [safeCategories]);

  // Auto-rotate hero images
  useEffect(() => {
    if (heroProducts.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        (prevIndex + 1) % heroProducts.length
      );
    }, 4000); // Change image every 4 seconds

    return () => clearInterval(interval);
  }, [heroProducts.length]);

  // Auto-rotate notification messages
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) =>
        (prevIndex + 1) % notificationMessages.length
      );
    }, 6000); // Change message every 6 seconds

    return () => clearInterval(messageInterval);
  }, [notificationMessages.length]);

  const handleAddToCart = useCallback((product, event) => {
    event.preventDefault();
    event.stopPropagation();
    setLastAddedProduct(product);
    setShowCartModal(true);
  }, []);

  return (
    <div className="home">
      <SEO 
        title="Dry Fruit Laddus Online | Premium Nutri Laddus | FHAMMS Nutri Bites"
        description="Buy premium dry fruit laddus online at FHAMMS Nutri Bites. Handmade dry fruit laddus with almonds, cashews, dates & jaggery. Best dry fruit laddus in India. Order now for healthy & delicious laddus."
        keywords="dry fruit laddus, dry fruit laddu, dry fruit laddus online, buy dry fruit laddus, premium dry fruit laddus, dry fruit laddus price, best dry fruit laddus, dry fruit laddus near me, homemade dry fruit laddus, healthy dry fruit laddus, nutri laddus"
      />
      <Navbar />

      {/* Flow Notification Banner */}
      <div className="home__notification-banner">
        <div className="home__notification-container">
          <div className="home__notification-content">
            <span className="home__notification-icon">{notificationMessages[currentMessageIndex].icon}</span>
            <span className="home__notification-text">
              {notificationMessages[currentMessageIndex].text}
            </span>
            <span className="home__notification-icon">{notificationMessages[currentMessageIndex].accentIcon}</span>
          </div>

          {/* Message Indicators */}
          {/* <div className="home__notification-indicators">
            {notificationMessages.map((_, index) => (
              <button
                key={index}
                className={`home__notification-indicator ${index === currentMessageIndex ? 'home__notification-indicator--active' : ''}`}
                onClick={() => setCurrentMessageIndex(index)}
                aria-label={`View message ${index + 1}`}
              />
            ))}
          </div> */}
        </div>
      </div>

      {/* Ultra Premium Dry Fruit Hero - Research Inspired Design */}
    {/* ================= CREATIVE PREMIUM HERO ================= */}
<section className="home-hero">
  <div className="hero-bg-blobs">
    <span className="blob green"></span>
    <span className="blob gold"></span>
  </div>

  <div className="home-hero__content">
    <span className="home-hero__badge">🌿 Premium Nutri Laddus</span>

    <h1 className="home-hero__title">
      <span className="line">Healthy Bites.</span>
      <span className="line highlight">Traditionally Crafted.</span>
    </h1>

    <p className="home-hero__subtitle">
      Handcrafted dry fruit laddus made with pure jaggery,
      premium nuts and zero preservatives.
    </p>

    <div className="home-hero__actions">
      <Link to="/products" className="home-hero__cta primary">
        Shop Now
      </Link>

      <button
        className="home-hero__cta secondary"
        onClick={() =>
          document
            .getElementById('reviews')
            ?.scrollIntoView({ behavior: 'smooth' })
        }
      >
        ⭐ {safeStatistics.averageRating || 4.9} Rating
      </button>
    </div>

    <div className="home-hero__trust">
      <span>✔ No Preservatives</span>
      <span>✔ Premium Dry Fruits</span>
      <span>✔ 25K+ Happy Families</span>
    </div>
  </div>

  <div className="home-hero__image-wrapper">
    <div className="image-frame">
      {heroProducts.length > 0 && (
        <img
          src={heroProducts[currentImageIndex]?.image}
          alt="Premium Nutri Laddus"
          key={currentImageIndex}
          className="hero-product-image"
        />
      )}
    </div>
  </div>
</section>
{/* ================= END HERO ================= */}


      {/* Shop by Category Section */}
<div id="categories" className="home__section home__section--animated">
  <div className="home__section-header">
    <h2 className="home__section-title">
      Shop Premium Dry Fruit Laddus by <span>Category</span>
    </h2>
    <p className="home__section-subtitle">
      Explore our wide variety of premium dry fruit laddus – from traditional recipes
      to modern healthy variants. Buy the best dry fruit laddus online!
    </p>
  </div>

  <div className="home__categories">
    {displayedCategories.map((category, idx) => (
    
      <Link
        key={category._id || idx}
        to={`/products?category=${encodeURIComponent(category.name)}`}
        className="home__product-link"
        style={{ '--delay': `${idx * 0.12}s` }}
      >
       
        <div className="home__category-card">
          <div className="home__category-image-wrapper">
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="home__category-image"
                loading="lazy"
              />
            ) : (
              <span className="home__category-placeholder">🍪</span>
            )}
          </div>

          <h3 className="home__category-name">{category.name}</h3>
        </div>
      </Link>
    ))}
  </div>
</div>



      {/* Trending Now Section */}
      {trendingProducts.length > 0 && (
        <div className="home__trending-section">
          <div className="home__trending-container">
            <div className="home__trending-header">
              <div className="home__trending-title-section">
                <h2 className="home__trending-title">
                  <span className="home__trending-title-icon">🏆</span>
                  Best Selling Dry Fruit Laddus
                  <span className="home__trending-title-icon">🏆</span>
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
                <div
                  key={prod._id}
                  className={`home__product-card home__product-card--delay-${idx + 1}`}
                >
                  {prod.isBestseller && (
                    <div className="home__product-badge home__product-badge--animated">
                      <span className="home__product-badge-icon">🔥</span>
                      BESTSELLER
                    </div>
                  )}
                  <Link to={`/products/${prod._id}`} className="home__product-link">
                    {prod.image && (
                      <div
                        className={`home__product-image home__product-image--delay-${idx + 1}`}
                        style={{ '--bg-image': `url(${prod.image})` }}
                      />
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
                      className="home__product-button home__product-button--animated"
                    >
                      <span className="home__product-button-icon">🛒</span>
                      Add to Cart
                    </button>
                  </div>

                  {/* Floating animation elements */}
                  <div className="home__product-floating-elements">
                    <div className="home__product-float-item home__product-float-item--1">⭐</div>
                    <div className="home__product-float-item home__product-float-item--2">✨</div>
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

      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={lastAddedProduct}
        onAddToCart={addToCart}
      />
    </div>
  );
}
export default Home;
