const DEFAULT_RATE = 56.5;

export default function PaymentMethodSelector({ value, onChange, total = 0 }) {
  const rate = parseFloat(localStorage.getItem('etbRate')) || DEFAULT_RATE;
  const etbTotal = (total * rate).toFixed(2);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-bold text-slate-700">Payment Method</h3>

      {/* Stripe */}
      <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
        value === 'stripe'
          ? 'border-indigo-500 bg-indigo-50'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}>
        <input
          type="radio"
          name="paymentMethod"
          value="stripe"
          checked={value === 'stripe'}
          onChange={() => onChange('stripe')}
          className="mt-0.5 accent-indigo-600"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            <p className="text-sm font-semibold text-slate-800">Card Payment (Stripe)</p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Visa, Mastercard, and more — charged in USD</p>
          <p className="text-base font-bold text-indigo-600 mt-2">${total.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span></p>
        </div>
      </label>

      {/* Chapa */}
      <label className={`flex items-start gap-4 p-4 border-2 rounded-xl cursor-pointer transition-all ${
        value === 'chapa'
          ? 'border-emerald-500 bg-emerald-50'
          : 'border-slate-200 hover:border-slate-300 bg-white'
      }`}>
        <input
          type="radio"
          name="paymentMethod"
          value="chapa"
          checked={value === 'chapa'}
          onChange={() => onChange('chapa')}
          className="mt-0.5 accent-emerald-600"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <p className="text-sm font-semibold text-slate-800">Chapa (Local Payment)</p>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Pay with Ethiopian Birr via Chapa</p>
          {value === 'chapa' && (
            <p className="text-base font-bold text-emerald-600 mt-2">ETB {etbTotal} <span className="text-xs font-normal text-slate-400">Ethiopian Birr</span></p>
          )}
        </div>
      </label>
    </div>
  );
}
