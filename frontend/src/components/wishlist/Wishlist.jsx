import { Link } from 'react-router-dom';
import WishlistItem from './WishlistItem';

export default function Wishlist({ items = [], onItemRemoved }) {
  if (!items.length) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <p className="text-slate-600 font-semibold mb-1">Your wishlist is empty</p>
        <p className="text-slate-400 text-sm mb-5">Save items you love to buy them later.</p>
        <Link to="/products" className="btn-primary">Browse Products</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <WishlistItem
          key={item.productId?._id || item._id || i}
          item={item}
          onRemoved={onItemRemoved}
        />
      ))}
    </div>
  );
}
