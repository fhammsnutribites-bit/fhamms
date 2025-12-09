import '../styles/components/price-display.css';

/**
 * Reusable Price Display Component
 * Shows original price (strikethrough) and discounted price with badge
 */
function PriceDisplay({ 
  originalPrice, 
  discountedPrice, 
  discountInfo, 
  hasDiscount,
  size = 'medium',
  showBadge = true 
}) {
  if (!hasDiscount || !discountInfo) {
    return (
      <span className={`price-display price-display--${size}`}>
        ₹{originalPrice.toFixed(2)}
      </span>
    );
  }

  return (
    <div className={`price-display price-display--${size}`}>
      <div className="price-display__container">
        <span className="price-display__original">
          ₹{originalPrice.toFixed(2)}
        </span>
        <span className="price-display__discounted">
          ₹{discountedPrice.toFixed(2)}
        </span>
        {showBadge && (
          <span className="price-display__badge">
            {discountInfo.type === 'percentage' 
              ? `${discountInfo.value}% OFF` 
              : `₹${discountInfo.value} OFF`}
          </span>
        )}
      </div>
    </div>
  );
}

export default PriceDisplay;



