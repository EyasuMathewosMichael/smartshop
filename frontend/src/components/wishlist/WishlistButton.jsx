import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

export default function WishlistButton({ productId, initialWishlisted = false, className = '' }) {
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(initialWishlisted);
  const [loading, setLoading] = useState(false);

  async function handleToggle(e) {
    e.preventDefault();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setLoading(true);
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${productId}`);
      } else {
        await api.post(`/wishlist/${productId}`);
      }
      setWishlisted(w => !w);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`p-2 rounded-full transition-colors ${wishlisted ? 'text-red-500 hover:text-red-700' : 'text-gray-400 hover:text-red-400'} ${className}`}
      aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={wishlisted}
    >
      {wishlisted ? '❤️' : '🤍'}
    </button>
  );
}
