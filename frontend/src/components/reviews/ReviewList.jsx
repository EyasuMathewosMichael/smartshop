import ReviewCard from './ReviewCard';

export default function ReviewList({ reviews = [], onReviewChanged }) {
  if (!reviews.length) {
    return (
      <div className="text-center py-8 text-slate-400">
        <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-sm">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div>
      {reviews.map(review => (
        <ReviewCard key={review._id} review={review} onChanged={onReviewChanged} />
      ))}
    </div>
  );
}
