import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import PriceDisplay from '../components/PriceDisplay.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import { getProductPriceInfo } from '../utils/discount.js';
import { productsApi } from '../services/productsApi.js';
import '../styles/pages/products.css';

function Products() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToCart } = useCart();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productsApi.getAll();
      setProducts(data);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

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
      <SEO 
        title="Buy Dry Fruit Laddus Online | Premium Nutri Laddus Collection"
        description="Shop premium dry fruit laddus online. Browse our collection of healthy dry fruit laddus - almond laddus, cashew laddus, dates laddus, and more. Best prices on dry fruit laddus with free delivery."
        keywords="dry fruit laddus online, buy dry fruit laddus, dry fruit laddus price, almond laddus, cashew laddus, dates laddus, premium laddus, healthy laddus"
      />
      {/* Products Collection Structured Data */}
      {products.length > 0 && (
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Dry Fruit Laddus Collection",
            "description": "Premium collection of dry fruit laddus - almond laddus, cashew laddus, dates laddus and more",
            "url": "https://fhamms.vercel.app/products",
            "mainEntity": {
              "@type": "ItemList",
              "numberOfItems": products.length,
              "itemListElement": products.slice(0, 10).map((prod, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                  "@type": "Product",
                  "name": prod.name,
                  "url": `https://fhamms.vercel.app/products/${prod._id}`,
                  "image": prod.image,
                  "offers": {
                    "@type": "Offer",
                    "price": prod.price || prod.basePrice,
                    "priceCurrency": "INR"
                  }
                }
              }))
            }
          })}
        </script>
      )}
      <Navbar />
      <div className="products__container">
        <div className="products__header">
          <h1 className="products__title">Premium Dry Fruit Laddus Collection</h1>
          <p className="products__subtitle">Buy the best dry fruit laddus online - handcrafted with almonds, cashews, dates & jaggery. Premium quality dry fruit laddus delivered fresh to your doorstep!</p>
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
                  <RatingDisplay 
                    rating={5} 
                    reviewCount={Math.floor(Math.random() * 200 + 50)}
                    size="small"
                  />
                  <PriceDisplay
                    originalPrice={getProductPriceInfo(prod)?.original || prod.price || prod.basePrice}
                    discountedPrice={getProductPriceInfo(prod)?.discounted}
                    discountInfo={getProductPriceInfo(prod)?.discountInfo}
                    hasDiscount={getProductPriceInfo(prod)?.hasDiscount || false}
                    size="medium"
                  />
                </div>
              </Link>
              <div className="products__card-actions">
                <button
                  onClick={(e) => handleAddToCart(prod, e)}
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
