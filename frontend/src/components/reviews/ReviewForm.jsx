import { useState } from 'react';
import api from '../../utils/api';

export default function ReviewForm({ productId, onReviewAdded }) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!rating) { setError('Please select a rating.'); return; }
    if (!comment.trim()) { setError('Please write a comment.'); return; }
    setError('');
    setSubmitting(true);
    try {
      await api.post(`/products/${productId}/reviews`, { rating, comment });
      setRating(0);
      setComment('');
      onReviewAdded?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="card p-5 mb-6 space-y-4">
      <h3 className="text-sm font-bold text-slate-700">Write a Review</h3>

      {error && (
        <p className="text-red-500 text-xs bg-red-50 px-3 py-2 rounded-lg">{error}</p>
      )}

      {/* Star selector */}
      <div>
        <p className="label">Your Rating</p>
        <div className="flex gap-1" role="group" aria-label="Rating">
          {[1, 2, 3, 4, 5].map(s => (
            <button
              key={s}
              type="button"
              onClick={() => setRating(s)}
              onMouseEnter={() => setHovered(s)}
              onMouseLeave={() => setHovered(0)}
              className="focus:outline-none transition-transform hover:scale-110"
              aria-label={`${s} star${s > 1 ? 's' : ''}`}
            >
              <svg
                className={`w-7 h-7 transition-colors ${(hovered || rating) >= s ? 'text-amber-400' : 'text-slate-200'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" className="label">Your Review</label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={e => setComment(e.target.value)}
          placeholder="Share your experience with this product…"
          rows={3}
          maxLength={1000}
          className="input resize-none"
        />
        <p className="text-xs text-slate-400 mt-1 text-right">{comment.length}/1000</p>
      </div>

      <button type="submit" disabled={submitting} className="btn-primary">
        {submitting ? 'Submitting…' : 'Submit Review'}
      </button>
    </form>
  );
}
