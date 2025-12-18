import { useState, useRef } from 'react';
import { memo } from 'react';

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
    <form onSubmit={handleSubmit} onClick={handleFormClick}>
      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Rating: *
        </label>
        <div style={{ display: 'flex', gap: '5px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: star <= (hoverRating || rating) ? '#ffc107' : '#ddd'
              }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '15px' }}>
        <label style={{ display: 'block', fontWeight: '600', marginBottom: '8px' }}>
          Review (Optional):
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this product..."
          style={{
            width: '100%',
            minHeight: '80px',
            padding: '10px',
            border: '1px solid #ddd',
            borderRadius: '6px',
            fontSize: '14px',
            resize: 'vertical'
          }}
          maxLength={500}
        />
        <div style={{ fontSize: '12px', color: '#666', textAlign: 'right', marginTop: '5px' }}>
          {comment.length}/500
        </div>
      </div>

      {error && (
        <div style={{
          color: '#dc3545',
          fontSize: '14px',
          marginBottom: '10px',
          padding: '8px',
          background: '#f8d7da',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || rating < 1}
        style={{
          padding: '10px 20px',
          background: loading ? '#6c757d' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontSize: '14px',
          fontWeight: '600',
          transition: 'background-color 0.2s ease'
        }}
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

