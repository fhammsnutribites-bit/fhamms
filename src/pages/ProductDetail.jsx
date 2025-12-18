import { useEffect, useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import SEO from '../SEO.jsx';
import PriceDisplay from '../components/PriceDisplay.jsx';
import RatingDisplay from '../components/RatingDisplay.jsx';
import Loader from '../components/Loader.jsx';
import { getProductPriceInfo } from '../utils/discount.js';
import { formatDescription } from '../utils/descriptionFormatter.js';
import { productsApi } from '../services/productsApi.js';
import { reviewsApi } from '../services/reviewsApi.js';
import '../styles/pages/product-detail.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsPagination, setReviewsPagination] = useState(null);
  const { addToCart, addingToCart } = useCart();

  const fetchProduct = useCallback(async () => {
    if (!id) {
      setError('Invalid product ID');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.getById(id);
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
    } finally {
      setLoading(false);
    }
  }, [id]);

  const fetchReviews = useCallback(async (page = 1) => {
    if (!id) return;

    setReviewsLoading(true);
    try {
      const data = await reviewsApi.getProductReviews(id, page, 5);
      setReviews(prev => page === 1 ? data.reviews : [...prev, ...data.reviews]);
      setReviewsPagination(data.pagination);
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setReviewsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  useEffect(() => {
    if (product) {
      fetchReviews();
    }
  }, [product, fetchReviews]);

  const handleWeightChange = useCallback((weightOption) => {
    setSelectedWeight(weightOption);
    setQty(1); // Reset quantity when weight changes
  }, []);

  // SEO for product page - hooks must be called before any conditional returns
  const productTitle = useMemo(() => 
    product ? `${product.name} | Buy ${product.name} Online | Dry Fruit Laddus` : '',
    [product?.name]
  );
  
  const productDescription = useMemo(() => 
    product ? `Buy ${product.name} online. ${product.description || 'Premium dry fruit laddus made with quality ingredients.'} Order now for best prices and free delivery.` : '',
    [product?.name, product?.description]
  );
  
  const productKeywords = useMemo(() => 
    product ? `${product.name}, dry fruit laddus, ${product.category}, buy ${product.name} online, ${product.name} price` : '',
    [product?.name, product?.category]
  );

  const priceInfo = useMemo(() => 
    product && selectedWeight ? getProductPriceInfo(product, selectedWeight) : null,
    [selectedWeight, product]
  );
  
  const currentPrice = useMemo(() => 
    priceInfo ? (priceInfo.hasDiscount ? priceInfo.discounted : priceInfo.original) : (product?.price || product?.basePrice || 0),
    [priceInfo, product?.price, product?.basePrice]
  );
  
  const currentStock = useMemo(() => 
    selectedWeight ? selectedWeight.stock : product?.stock,
    [selectedWeight, product?.stock]
  );

  const handleAddToCart = useCallback(async () => {
    if (!selectedWeight || !product) {
      alert('Please select a weight option');
      return;
    }
    // Use discounted price if available
    const priceInfo = getProductPriceInfo(product, selectedWeight);
    const finalPrice = priceInfo && priceInfo.hasDiscount ? priceInfo.discounted : selectedWeight.price;

    const productWithWeight = {
      ...product,
      price: finalPrice,
      originalPrice: priceInfo ? priceInfo.original : selectedWeight.price,
      selectedWeight: selectedWeight.weight,
      weightOption: selectedWeight
    };

    try {
      await addToCart(productWithWeight, qty);
      navigate('/cart');
    } catch (error) {
      // Error is already handled in CartContext, just don't navigate on error
      console.error('Failed to add item to cart:', error);
    }
  }, [selectedWeight, product, qty, addToCart, navigate]);

  // Early returns after all hooks
  if (loading) return (
    <div>
      <Navbar />
      <Loader size="large" text="Loading product..." fullPage={false} />
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

  return (
    <div className="product-detail">
      <SEO 
        title={productTitle}
        description={productDescription}
        keywords={productKeywords}
        image={product.image}
        type="product"
      />
      {/* Product Structured Data for SEO */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          "name": product.name,
          "description": product.description,
          "image": product.image,
          "brand": {
            "@type": "Brand",
            "name": "FHAMMS Nutri Bites"
          },
          "offers": {
            "@type": "AggregateOffer",
            "offerCount": product.weightOptions?.length || 1,
            "lowPrice": product.weightOptions?.length > 0 
              ? Math.min(...product.weightOptions.map(w => w.price))
              : product.price || product.basePrice,
            "highPrice": product.weightOptions?.length > 0
              ? Math.max(...product.weightOptions.map(w => w.price))
              : product.price || product.basePrice,
            "priceCurrency": "INR",
            "availability": "https://schema.org/InStock"
          },
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "5.0",
            "reviewCount": "50+"
          },
          "category": product.category || "Dry Fruit Laddus"
        })}
      </script>
      <Navbar />
      <div className="product-detail__container">
        <button
          onClick={() => navigate('/products')}
          className="product-detail__back-button"
        >
          ← Back to Products
        </button>
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

            {/* Rating Display */}
            {product.averageRating > 0 && (
              <div className="product-detail__rating">
                <RatingDisplay
                  rating={product.averageRating}
                  reviewCount={product.reviewCount}
                  size="medium"
                  showCount={true}
                />
              </div>
            )}

            <div className="product-detail__price-section">
              <PriceDisplay
                originalPrice={priceInfo?.original || currentPrice}
                discountedPrice={priceInfo?.discounted}
                discountInfo={priceInfo?.discountInfo}
                hasDiscount={priceInfo?.hasDiscount || false}
                size="large"
              />
            </div>
            <div className="product-detail__description">
              <h3 className="product-detail__description-title">Description</h3>
              <div
                className="product-detail__description-text"
                dangerouslySetInnerHTML={{ __html: formatDescription(product.description) }}
              />
            </div>
            
            {/* Weight Selection */}
            {product.weightOptions && product.weightOptions.length > 0 && (
              <div className="product-detail__weight-selection">
                <label className="product-detail__weight-label">Select Weight:</label>
                <div className="product-detail__weight-options">
                  {product.weightOptions.map((weightOpt, idx) => {
                    const weightPriceInfo = getProductPriceInfo(product, weightOpt);
                    return (
                      <button
                        key={idx}
                        onClick={() => handleWeightChange(weightOpt)}
                        className={`product-detail__weight-option ${selectedWeight?.weight === weightOpt.weight ? 'product-detail__weight-option--active' : ''}`}
                      >
                        <div className="product-detail__weight-option-weight">{weightOpt.weight}g</div>
                        <PriceDisplay
                          originalPrice={weightPriceInfo?.original || weightOpt.price}
                          discountedPrice={weightPriceInfo?.discounted}
                          discountInfo={weightPriceInfo?.discountInfo}
                          hasDiscount={weightPriceInfo?.hasDiscount || false}
                          size="small"
                        />
                        {/* Stock information hidden as per requirements */}
                        {/* {weightOpt.stock <= 10 && weightOpt.stock > 0 && (
                          <div className="product-detail__weight-option-stock">Only {weightOpt.stock} left!</div>
                        )} */}
                      </button>
                    );
                  })}
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
                {/* Stock information hidden as per requirements */}
                {/* <span className="product-detail__stock">
                  {currentStock ? `${currentStock} in stock` : 'Available'}
                </span> */}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="product-detail__button"
              disabled={(!selectedWeight && product.weightOptions?.length > 0) || addingToCart}
            >
              {addingToCart ? 'Adding to Cart...' : '🛒 Add to Cart'}
            </button>
            {selectedWeight && (
              <div className="product-detail__total-preview">
                Total: ₹{(currentPrice * qty).toFixed(2)} ({qty} × {selectedWeight.weight}g)
              </div>
            )}
          </div>
        </div>

        {/* Reviews Section */}
        <div className="product-detail__reviews-section">
          <h2 className="product-detail__reviews-title">Customer Reviews</h2>

          {reviews.length > 0 ? (
            <div className="product-detail__reviews-list">
              {reviews.map((review) => (
                <div key={review._id} className="product-detail__review-item">
                  {/* Customer Name and Rating Header */}
                  <div className="product-detail__review-main-header">
                    <div className="product-detail__review-customer">
                      <div className="product-detail__user-avatar">
                        {(review.user?.name || 'Anonymous').charAt(0).toUpperCase()}
                      </div>
                      <div className="product-detail__customer-info">
                        <h4 className="product-detail__customer-name">
                          {review.user?.name || 'Anonymous'}
                          {review.isVerified && (
                            <span className="product-detail__verified-badge">✓ Verified</span>
                          )}
                        </h4>
                        <div className="product-detail__review-rating">
                          <RatingDisplay rating={review.rating} size="small" showCount={false} />
                          <span className="product-detail__rating-value">({review.rating}/5)</span>
                        </div>
                      </div>
                    </div>
                    <div className="product-detail__review-date">
                      📅 {new Date(review.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </div>
                  </div>

                  {/* Review Message */}
                  {review.comment && (
                    <div className="product-detail__review-message">
                      <div className="product-detail__message-content">
                        {review.comment}
                      </div>
                    </div>
                  )}
                  {review.images && review.images.length > 0 && (
                    <div className="product-detail__review-images">
                      {review.images.map((image, idx) => (
                        <img
                          key={idx}
                          src={image}
                          alt={`Review image ${idx + 1}`}
                          className="product-detail__review-image"
                          onClick={() => window.open(image, '_blank')}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {reviewsPagination && reviewsPagination.page < reviewsPagination.pages && (
                <button
                  onClick={() => fetchReviews(reviewsPagination.page + 1)}
                  disabled={reviewsLoading}
                  className="product-detail__load-more-reviews"
                >
                  {reviewsLoading ? 'Loading...' : 'Load More Reviews'}
                </button>
              )}
            </div>
          ) : !reviewsLoading ? (
            <div className="product-detail__no-reviews">
              <p>No reviews yet. Be the first to review this product!</p>
            </div>
          ) : null}

          {reviewsLoading && reviews.length === 0 && (
            <div className="product-detail__reviews-loading">
              Loading reviews...
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}
export default ProductDetail;
