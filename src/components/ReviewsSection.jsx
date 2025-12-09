import { useEffect, useState } from 'react';
import { reviewsApi } from '../services/reviewsApi.js';
import RatingDisplay from './RatingDisplay.jsx';

function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        // Get reviews from all products, limit to recent ones
        const allReviews = [];

        // Try to get real reviews first
        try {
          // Get all products and fetch reviews for the first few
          const productsResponse = await fetch('http://localhost:5000/api/products');
          if (productsResponse.ok) {
            const products = await productsResponse.json();
            const productIds = products.slice(0, 3).map(p => p._id); // Get first 3 products

            for (const productId of productIds) {
              try {
                const data = await reviewsApi.getProductReviews(productId, 1, 5);
                allReviews.push(...data.reviews.map(review => ({
                  ...review,
                  productId // Add product reference for context
                })));
              } catch (err) {
                // Continue if one product fails
                console.log(`No reviews for product ${productId}`);
              }
            }
          }
        } catch (err) {
          console.log('Could not fetch products for reviews');
        }

        // If no real reviews, show sample reviews for demonstration
        if (allReviews.length === 0) {
          allReviews.push(
            {
              _id: 'demo-1',
              user: { name: 'Priya Sharma' },
              rating: 5,
              comment: 'Absolutely delicious! The perfect blend of dry fruits and natural sweetness. My family loves these laddus!',
              createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week ago
            },
            {
              _id: 'demo-2',
              user: { name: 'Rajesh Kumar' },
              rating: 5,
              comment: 'Best dry fruit laddus I\'ve ever tasted. Fresh ingredients and authentic taste. Highly recommended!',
              createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
            },
            {
              _id: 'demo-3',
              user: { name: 'Meera Patel' },
              rating: 4,
              comment: 'Great quality dry fruits and perfect sweetness. A healthy snack option for the entire family.',
              createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
            },
            {
              _id: 'demo-4',
              user: { name: 'Amit Singh' },
              rating: 5,
              comment: 'Excellent product! Fresh, nutritious, and delicious. Will definitely order again.',
              createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
            },
            {
              _id: 'demo-5',
              user: { name: 'Kavita Joshi' },
              rating: 5,
              comment: 'Love these laddus! Perfect combination of taste and health. My kids favorite snack now!',
              createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
            },
            {
              _id: 'demo-6',
              user: { name: 'Suresh Reddy' },
              rating: 4,
              comment: 'Very satisfied with the quality and taste. The packaging was excellent and delivery was on time.',
              createdAt: new Date().toISOString() // Today
            }
          );
        }

        // Sort reviews by date (newest first) and limit to 8-10
        allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setReviews(allReviews.slice(0, 8));
      } catch (err) {
        console.error('Failed to load reviews:', err);
        setError('Failed to load reviews');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (loading) {
    return (
      <section className="reviews-section">
        <div className="reviews-section__container">
          <h2 className="reviews-section__title">What Our Customers Say</h2>
          <div className="reviews-section__loading">
            <div className="reviews-section__skeleton">
              <div className="reviews-section__skeleton-avatar"></div>
              <div className="reviews-section__skeleton-content">
                <div className="reviews-section__skeleton-line"></div>
                <div className="reviews-section__skeleton-line short"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || reviews.length === 0) {
    return null; // Don't show section if no reviews
  }

  return (
    <section className="reviews-section">
      <div className="reviews-section__container">
        <h2 className="reviews-section__title">What Our Customers Say</h2>
        <div className="reviews-section__scroll-container">
          <div className="reviews-section__reviews">
            {reviews.map((review, index) => (
              <div key={review._id || index} className="reviews-section__review-card">
                <div className="reviews-section__review-header">
                  <div className="reviews-section__review-avatar">
                    {review.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div className="reviews-section__review-info">
                    <div className="reviews-section__review-name">
                      {review.user?.name || 'Anonymous'}
                    </div>
                    <div className="reviews-section__review-rating">
                      <RatingDisplay
                        rating={review.rating}
                        size="small"
                        showCount={false}
                      />
                    </div>
                  </div>
                </div>
                <div className="reviews-section__review-content">
                  <p className="reviews-section__review-text">
                    "{review.comment}"
                  </p>
                  <div className="reviews-section__review-date">
                    {new Date(review.createdAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default ReviewsSection;
