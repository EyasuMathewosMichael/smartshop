export default function OrderSummary({ items = [], shippingAddress = {}, total = 0, paymentMethod = '' }) {
  const shipping = total > 50 ? 0 : 5.99;
  const displayTotal = total + shipping;

  return (
    <div className="card p-5 space-y-4 sticky top-24">
      <h3 className="font-bold text-slate-800">Order Review</h3>

      {/* Items */}
      {items.length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm gap-2">
              <span className="text-slate-600 truncate flex-1">
                {item.product?.name || item.name} <span className="text-slate-400">×{item.quantity}</span>
              </span>
              <span className="font-medium text-slate-800 shrink-0">
                ${((item.price || 0) * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Totals */}
      <div className="border-t border-slate-100 pt-3 space-y-2">
        <div className="flex justify-between text-sm text-slate-500">
          <span>Subtotal</span>
          <span>${total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-500">
          <span>Shipping</span>
          <span className={shipping === 0 ? 'text-emerald-600 font-medium' : ''}>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-100">
          <span>Total</span>
          <span>${displayTotal.toFixed(2)}</span>
        </div>
      </div>

      {/* Ship to */}
      {shippingAddress.fullName && (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Ship to</p>
          <p className="text-xs text-slate-600">{shippingAddress.fullName}</p>
          <p className="text-xs text-slate-500">{shippingAddress.addressLine1}, {shippingAddress.city}</p>
          <p className="text-xs text-slate-500">{shippingAddress.country}</p>
        </div>
      )}

      {/* Payment */}
      {paymentMethod && (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Payment</p>
          <p className="text-xs text-slate-600 capitalize font-medium">{paymentMethod === 'stripe' ? 'Stripe (USD)' : 'Chapa (ETB)'}</p>
        </div>
      )}
    </div>
  );
}
