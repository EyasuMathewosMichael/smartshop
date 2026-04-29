export default function CartSummary({ subtotal = 0, total = 0, onCheckout }) {
  const shipping = subtotal > 50 ? 0 : 5.99;
  const displayTotal = subtotal + shipping;

  return (
    <div className="card p-5 space-y-4 sticky top-24">
      <h2 className="text-base font-bold text-slate-800">Order Summary</h2>

      <div className="space-y-2.5">
        <div className="flex justify-between text-sm text-slate-600">
          <span>Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm text-slate-600">
          <span>Shipping</span>
          {shipping === 0 ? (
            <span className="text-emerald-600 font-semibold">Free</span>
          ) : (
            <span className="font-medium">${shipping.toFixed(2)}</span>
          )}
        </div>
        {subtotal > 0 && subtotal < 50 && (
          <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
            Add ${(50 - subtotal).toFixed(2)} more for free shipping
          </p>
        )}
      </div>

      <div className="border-t border-slate-100 pt-3 flex justify-between font-bold text-slate-800">
        <span>Total</span>
        <span className="text-lg">${displayTotal.toFixed(2)}</span>
      </div>

      <button
        onClick={onCheckout}
        className="btn-primary w-full py-3 text-base"
      >
        Proceed to Checkout
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <p className="text-xs text-center text-slate-400">
        Secure checkout powered by Stripe & Chapa
      </p>
    </div>
  );
}
