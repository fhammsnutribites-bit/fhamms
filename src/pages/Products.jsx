import { useEffect, useState, useCallback, useMemo } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import AddToCartModal from '../components/AddToCartModal.jsx';
import SEO from '../SEO.jsx';
import PriceDisplay from '../components/PriceDisplay.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import Loader from '../components/Loader.jsx';
import { getProductPriceInfo, getBestWeightOption } from '../utils/discount.js';
import { productsApi } from '../services/productsApi.js';
import '../styles/pages/products.css';

function Products() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [showCartModal, setShowCartModal] = useState(false);
  const [lastAddedProduct, setLastAddedProduct] = useState(null);
  const { addToCart, addingToCart } = useCart();

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

  // CONSOLIDATED: Load products and set category from URL on mount
  useEffect(() => {
    // Load products
    fetchProducts();

    // Set category from URL parameter on mount
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(decodeURIComponent(categoryParam));
    }
  }, [fetchProducts, searchParams]);

  const categories = useMemo(() => {
    return ['All', ...new Set(products.map(p => p.category).filter(Boolean))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });

    // Sort bestsellers first
    return filtered.sort((a, b) => {
      if (a.isBestseller && !b.isBestseller) return -1;
      if (!a.isBestseller && b.isBestseller) return 1;
      return 0;
    });
  }, [products, selectedCategory, searchTerm]);

  const handleAddToCart = useCallback((product, event) => {
    event.preventDefault();
    event.stopPropagation();
    // Always include image in product object for cart
    setLastAddedProduct({ ...product, image: product.image });
    setShowCartModal(true);
  }, []);

  if (loading) return (
    <div>
      <Navbar />
      <Loader size="large" text="Loading products..." fullPage={false} />
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
              {prod.isBestseller && (
                <div className="products__card-badge">
                  BESTSELLER
                </div>
              )}
              <Link to={`/products/${prod._id}`} className="products__card-link">
                {prod.image && (
                  <div className="products__card-image" style={{ '--product-image-url': `url(${prod.image})` }} />
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
                    originalPrice={getProductPriceInfo(prod)?.original || 0}
                    discountedPrice={getProductPriceInfo(prod)?.discounted}
                    discountInfo={getProductPriceInfo(prod)?.discountInfo}
                    hasDiscount={getProductPriceInfo(prod)?.hasDiscount || false}
                    size="medium"
                    weight={getBestWeightOption(prod)?.weight}
                  />
                </div>
              </Link>
              <div className="products__card-actions">
                <button
                  onClick={(e) => handleAddToCart(prod, e)}
                  className="products__card-button"
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
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

      <AddToCartModal
        isOpen={showCartModal}
        onClose={() => setShowCartModal(false)}
        product={lastAddedProduct}
        onAddToCart={addToCart}
      />
    </div>
  );
}
export default Products;
