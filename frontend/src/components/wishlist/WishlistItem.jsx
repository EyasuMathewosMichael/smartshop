import { Link } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import api from '../../utils/api';

export default function WishlistItem({ item, onRemoved }) {
  const { addItem } = useCart();
  const product = item.productId || item.product || item;
  const imageUrl = product.images?.[0]?.url || null;
  const inStock = product.stock > 0 && product.isAvailable !== false;

  async function handleMoveToCart() {
    try {
      await addItem(product._id, 1);
      await api.delete(`/wishlist/${product._id}`);
      onRemoved?.();
    } catch { /* silently fail */ }
  }

  async function handleRemove() {
    try {
      await api.delete(`/wishlist/${product._id}`);
      onRemoved?.();
    } catch { /* silently fail */ }
  }

  return (
    <div className="card p-4 flex items-center gap-4">
      {/* Image */}
      <Link to={`/products/${product._id}`} className="shrink-0">
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100">
          {imageUrl ? (
            <img src={imageUrl} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${product._id}`} className="text-sm font-semibold text-slate-800 hover:text-indigo-600 line-clamp-2 transition-colors">
          {product.name}
        </Link>
        <p className="text-base font-bold text-indigo-600 mt-1">${product.price?.toFixed(2)}</p>
        <span className={`badge mt-1 ${inStock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
          {inStock ? 'In Stock' : 'Out of Stock'}
        </span>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2 shrink-0">
        <button
          onClick={handleMoveToCart}
          disabled={!inStock}
          className="btn-primary text-xs px-3 py-2 disabled:opacity-50"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Add to Cart
        </button>
        <button
          onClick={handleRemove}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors text-center"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
