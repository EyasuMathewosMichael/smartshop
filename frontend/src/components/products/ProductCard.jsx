import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';
import RatingDisplay from './RatingDisplay';

const DEFAULT_RATE = 56.5;

function formatPrice(price, currency) {
  const rate = parseFloat(localStorage.getItem('etbRate')) || DEFAULT_RATE;
  if (currency === 'ETB') return `ETB ${(price * rate).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `$${price.toFixed(2)}`;
}

export default function ProductCard({ product, currency = 'USD' }) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const [wishlisted, setWishlisted] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);

  const primaryImage = product.images?.find(img => img.isPrimary)?.url
    || product.images?.[0]?.url
    || null;

  async function handleAddToCart(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    setAddingToCart(true);
    try {
      await addItem(product._id, 1);
    } catch {
      // handled upstream
    } finally {
      setAddingToCart(false);
    }
  }

  async function handleWishlist(e) {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) { window.location.href = '/login'; return; }
    try {
      if (wishlisted) {
        await api.delete(`/wishlist/${product._id}`);
      } else {
        await api.post(`/wishlist/${product._id}`);
      }
      setWishlisted(w => !w);
    } catch {
      // silently fail
    }
  }

  const outOfStock = !product.isAvailable || product.stock === 0;

  return (
    <Link
      to={`/products/${product._id}`}
      className="group card overflow-hidden flex flex-col hover:shadow-md transition-shadow duration-200"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-slate-100 aspect-[4/3]">
        {primaryImage ? (
          <img
            src={primaryImage}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-300">
            <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}

        {/* Wishlist button */}
        <button
          onClick={handleWishlist}
          className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full shadow flex items-center justify-center hover:scale-110 transition-transform"
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <svg
            className={`w-4 h-4 transition-colors ${wishlisted ? 'text-red-500 fill-red-500' : 'text-slate-400'}`}
            fill={wishlisted ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </button>

        {/* Out of stock badge */}
        {outOfStock && (
          <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
            <span className="bg-white text-slate-700 text-xs font-semibold px-3 py-1 rounded-full">Out of Stock</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-xs text-indigo-600 font-semibold uppercase tracking-wide mb-1">{product.category}</p>
        <h3 className="text-sm font-semibold text-slate-800 line-clamp-2 mb-2 leading-snug">{product.name}</h3>
        <RatingDisplay rating={product.averageRating || 0} count={product.reviewCount || 0} />

        <div className="mt-auto pt-3 flex items-center justify-between gap-2">
          <span className="text-base font-bold text-slate-800">
            {formatPrice(product.price, currency)}
          </span>
          <button
            onClick={handleAddToCart}
            disabled={addingToCart || outOfStock}
            className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 text-white px-3 py-1.5 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            aria-label={`Add ${product.name} to cart`}
          >
            {addingToCart ? (
              <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            )}
            {addingToCart ? '' : 'Add'}
          </button>
        </div>
      </div>
    </Link>
  );
}
