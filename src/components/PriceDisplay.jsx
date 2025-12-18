import '../styles/components/price-display.css';

/**
 * Reusable Price Display Component
 * Shows original price (strikethrough) and discounted price with badge
 * Displays weight in brackets if provided
 */
function PriceDisplay({
  originalPrice,
  discountedPrice,
  discountInfo,
  hasDiscount,
  size = 'medium',
  showBadge = true,
  weight = null
}) {
  // Handle null/undefined prices gracefully
  const formatPrice = (price) => {
    const numPrice = Number(price);
    return isNaN(numPrice) ? 0 : numPrice;
  };

  const formattedOriginalPrice = formatPrice(originalPrice);
  const formattedDiscountedPrice = formatPrice(discountedPrice);

  const weightDisplay = weight ? ` (${weight}g)` : '';

  if (!hasDiscount || !discountInfo) {
    return (
      <span className={`price-display price-display--${size}`}>
        ₹{formattedOriginalPrice.toFixed(2)}{weightDisplay}
      </span>
    );
  }

  return (
    <div className={`price-display price-display--${size}`}>
      <div className="price-display__container">
        <span className="price-display__original">
          ₹{formattedOriginalPrice.toFixed(2)}{weightDisplay}
        </span>
        <span className="price-display__discounted">
          ₹{formattedDiscountedPrice.toFixed(2)}{weightDisplay}
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



