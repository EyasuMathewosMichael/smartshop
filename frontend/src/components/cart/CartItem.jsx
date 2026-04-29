export default function CartItem({ item, onUpdate, onRemove }) {
  const imageUrl = item.product?.images?.[0]?.url || item.image || null;
  const name = item.product?.name || item.name || 'Product';
  const price = item.price || item.product?.price || 0;
  const productId = item.productId || item.product?._id;

  return (
    <div className="flex items-center gap-4 py-4 border-b border-slate-100 last:border-0">
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
      <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden">
        <button
          onClick={() => onUpdate(productId, item.quantity - 1)}
          disabled={item.quantity <= 1}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
          aria-label="Decrease quantity"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        </button>
        <span className="w-8 text-center text-sm font-semibold text-slate-800">{item.quantity}</span>
        <button
          onClick={() => onUpdate(productId, item.quantity + 1)}
          className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
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
        onClick={() => onRemove(productId)}
        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
        aria-label={`Remove ${name}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      </button>
    </div>
  );
}
