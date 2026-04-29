import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export default function ReviewCard({ review, onChanged }) {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [saving, setSaving] = useState(false);

  const isOwn = user && (
    user._id === review.userId?._id ||
    user._id === review.userId ||
    user.id === review.userId
  );

  async function handleDelete() {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete(`/reviews/${review._id}`);
      onChanged?.();
    } catch { /* silently fail */ }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await api.put(`/reviews/${review._id}`, { rating: editRating, comment: editComment });
      setEditing(false);
      onChanged?.();
    } catch { /* silently fail */ } finally {
      setSaving(false);
    }
  }

  const reviewerName = review.userId?.name || 'Anonymous';
  const initials = reviewerName.charAt(0).toUpperCase();
  const date = new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="py-5 border-b border-slate-100 last:border-0">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-indigo-700">{initials}</span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div>
              <span className="text-sm font-semibold text-slate-800">{reviewerName}</span>
              <span className="text-xs text-slate-400 ml-2">{date}</span>
            </div>
            {isOwn && !editing && (
              <div className="flex gap-3 shrink-0">
                <button onClick={() => setEditing(true)} className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">Edit</button>
                <button onClick={handleDelete} className="text-xs text-red-500 hover:text-red-600 font-medium">Delete</button>
              </div>
            )}
          </div>

          {editing ? (
            <div className="space-y-3">
              <div className="flex gap-1">
                {[1,2,3,4,5].map(s => (
                  <button key={s} type="button" onClick={() => setEditRating(s)} className="focus:outline-none">
                    <svg className={`w-6 h-6 ${editRating >= s ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </button>
                ))}
              </div>
              <textarea
                value={editComment}
                onChange={e => setEditComment(e.target.value)}
                rows={2}
                className="input resize-none"
              />
              <div className="flex gap-2">
                <button onClick={handleSave} disabled={saving} className="btn-primary text-xs px-3 py-1.5">
                  {saving ? 'Saving…' : 'Save'}
                </button>
                <button onClick={() => setEditing(false)} className="btn-secondary text-xs px-3 py-1.5">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex gap-0.5 mb-2">
                {[1,2,3,4,5].map(s => (
                  <svg key={s} className={`w-4 h-4 ${s <= review.rating ? 'text-amber-400' : 'text-slate-200'}`} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">{review.comment}</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
