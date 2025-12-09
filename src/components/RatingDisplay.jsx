import '../styles/components/rating-display.css';

/**
 * Reusable Rating Display Component
 * Shows star rating with review count
 */
function RatingDisplay({ 
  rating = 5, 
  reviewCount = null,
  size = 'medium',
  showCount = true 
}) {
  const stars = Array.from({ length: 5 }, (_, i) => i < Math.floor(rating));
  
  return (
    <div className={`rating-display rating-display--${size}`}>
      <div className="rating-display__stars">
        {stars.map((filled, idx) => (
          <span 
            key={idx} 
            className={`rating-display__star ${filled ? 'rating-display__star--filled' : ''}`}
          >
            ★
          </span>
        ))}
      </div>
      {showCount && reviewCount !== null && (
        <span className="rating-display__count">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}

export default RatingDisplay;



