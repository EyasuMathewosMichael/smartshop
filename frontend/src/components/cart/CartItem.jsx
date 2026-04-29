import { useState } from 'react';

export default function CartItem({ item, onUpdate, onRemove }) {
  const [updating, setUpdating] = useState(false);
  const [removing, setRemoving] = useState(false);

  // productId can be a populated object or a plain string/ObjectId
  const productId = item.productId?._id
    || item.productId
    || item.product?._id
    || item.product;

  const productIdStr = productId?.toString?.() || String(productId);

  const imageUrl = item.productId?.images?.[0]?.url
    || item.product?.images?.[0]?.url
    || (typeof item.image === 'string' ? item.image : item.image?.url)
    || null;

  const name = item.productId?.name
    || item.product?.name
    || item.name
    || 'Product';

  const price = item.price || item.productId?.price || item.product?.price || 0;

  async function handleUpdate(newQty) {
    if (newQty < 1 || updating) return;
    setUpdating(true);
    try {
      await onUpdate(productIdStr, newQty);
    } finally {
      setUpdating(false);
    }
  }

  async function handleRemove() {
    if (removing) return;
    setRemoving(true);
    try {
      await onRemove(productIdStr);
    } finally {
      setRemoving(false);
    }
  }

  return (
    <div className="py-4 border-b border-slate-100 last:border-0">
      {/* Desktop layout */}
      <div className="hidden sm:flex items-center gap-4">
        {/* Image */}
        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-800 truncate">{name}</h3>
          <p className="text-sm text-indigo-600 font-semibold mt-0.5">${price.toFixed(2)}</p>
        </div>

        {/* Quantity stepper */}
        <div className={`flex items-center border border-slate-200 rounded-xl overflow-hidden ${updating ? 'opacity-60' : ''}`}>
          <button
            onClick={() => handleUpdate(item.quantity - 1)}
            disabled={item.quantity <= 1 || updating}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            aria-label="Decrease quantity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </button>
          <span className="w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
          <button
            onClick={() => handleUpdate(item.quantity + 1)}
            disabled={updating}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
            aria-label="Increase quantity"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>

        {/* Line total */}
        <p className="text-sm font-bold text-slate-800 w-16 text-right shrink-0">
          ${(price * item.quantity).toFixed(2)}
        </p>

        {/* Remove */}
        <button
          onClick={handleRemove}
          disabled={removing}
          className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40"
          aria-label={`Remove ${name}`}
        >
          {removing ? (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile layout */}
      <div className="flex sm:hidden gap-3">
        {/* Image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-slate-100 shrink-0">
          {imageUrl ? (
            <img src={imageUrl} alt={name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-slate-300">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>

        {/* Right side */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-800 leading-snug line-clamp-2">{name}</h3>
            <button
              onClick={handleRemove}
              disabled={removing}
              className="p-1 text-slate-300 hover:text-red-500 shrink-0 transition-colors"
              aria-label={`Remove ${name}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <p className="text-sm text-indigo-600 font-semibold mt-1">${price.toFixed(2)}</p>

          <div className="flex items-center justify-between mt-2">
            {/* Quantity stepper */}
            <div className={`flex items-center border border-slate-200 rounded-lg overflow-hidden ${updating ? 'opacity-60' : ''}`}>
              <button
                onClick={() => handleUpdate(item.quantity - 1)}
                disabled={item.quantity <= 1 || updating}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                aria-label="Decrease"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="w-7 text-center text-xs font-semibold text-slate-800">{item.quantity}</span>
              <button
                onClick={() => handleUpdate(item.quantity + 1)}
                disabled={updating}
                className="w-7 h-7 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
                aria-label="Increase"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Line total */}
            <p className="text-sm font-bold text-slate-800">
              ${(price * item.quantity).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
