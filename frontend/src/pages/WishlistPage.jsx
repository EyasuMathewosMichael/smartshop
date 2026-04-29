import { useState, useEffect } from 'react';
import api from '../utils/api';
import Wishlist from '../components/wishlist/Wishlist';
import Loader from '../components/common/Loader';

export default function WishlistPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchWishlist() {
    try {
      const res = await api.get('/wishlist');
      const data = res.data.wishlist || res.data;
      setItems(data.products || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchWishlist(); }, []);

  if (loading) return <Loader />;

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6">
        <h1 className="section-title">My Wishlist</h1>
        {items.length > 0 && (
          <p className="text-slate-500 text-sm mt-1">{items.length} saved item{items.length !== 1 ? 's' : ''}</p>
        )}
      </div>
      <Wishlist items={items} onItemRemoved={fetchWishlist} />
    </div>
  );
}
