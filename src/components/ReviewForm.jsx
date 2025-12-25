import { useState, useRef } from 'react';
import { memo } from 'react';
import '../styles/components/review-form.css';

/**
 * Review Form Component for submitting product reviews
 */
function ReviewForm({ productId, onSubmit, loading, error }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoverRating, setHoverRating] = useState(0);
  const onSubmitRef = useRef(onSubmit);

  // Keep the ref updated with the latest onSubmit
  onSubmitRef.current = onSubmit;

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading || rating < 1 || rating > 5) {
      return;
    }

    // Use ref to avoid stale closures
    onSubmitRef.current(rating, comment);
  };

  const handleFormClick = (e) => {
    e.stopPropagation();
  };

  return (
    <form className="review-form" onSubmit={handleSubmit} onClick={handleFormClick}>
      <div className="review-form__field">
        <label className="review-form__label">
          Rating: *
        </label>
        <div className="review-form__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={
                'review-form__star' + (star <= (hoverRating || rating) ? ' review-form__star--filled' : '')
              }
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div className="review-form__field">
        <label className="review-form__label">
          Review (Optional):
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          className="review-form__textarea"
          maxLength={500}
        />
        <div className="review-form__char-count">
          {comment.length}/500
        </div>
      </div>

      {error && (
        <div className="review-form__error">
          {error}
        </div>
      )}

      <button
        type="submit"
        className="review-form__submit"
        disabled={loading || rating < 1}
      >
        {loading ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
}

// Memoize with custom comparison to prevent unnecessary re-renders
export default memo(ReviewForm, (prevProps, nextProps) => {
  return (
    prevProps.productId === nextProps.productId &&
    prevProps.loading === nextProps.loading &&
    prevProps.error === nextProps.error &&
    prevProps.onSubmit === nextProps.onSubmit
  );
});

