import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import api from '../utils/api';
import PaymentMethodSelector from '../components/checkout/PaymentMethodSelector';
import OrderSummary from '../components/checkout/OrderSummary';

const INITIAL_ADDRESS = {
  fullName: '', addressLine1: '', addressLine2: '',
  city: '', state: '', postalCode: '', country: '', phone: ''
};

const FIELDS = [
  { name: 'fullName', label: 'Full Name', span: 2 },
  { name: 'phone', label: 'Phone Number', span: 2 },
  { name: 'addressLine1', label: 'Address Line 1', span: 2 },
  { name: 'addressLine2', label: 'Address Line 2 (optional)', span: 2, required: false },
  { name: 'city', label: 'City', span: 1 },
  { name: 'state', label: 'State / Province', span: 1 },
  { name: 'postalCode', label: 'Postal Code', span: 1 },
  { name: 'country', label: 'Country', span: 1 },
];

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState(INITIAL_ADDRESS);
  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  function validate() {
    const errs = {};
    FIELDS.filter(f => f.required !== false).forEach(f => {
      if (!address[f.name]?.trim()) errs[f.name] = 'Required';
    });
    return errs;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setApiError('');
    setSubmitting(true);

    try {
      const orderRes = await api.post('/orders', { shippingAddress: address, paymentMethod });
      const order = orderRes.data.order || orderRes.data;
      const orderId = order._id;

      if (paymentMethod === 'stripe') {
        const payRes = await api.post('/payments/stripe/create-session', { orderId });
        const url = payRes.data.url;
        if (url) { await clearCart(); window.location.href = url; }
      } else {
        const payRes = await api.post('/payments/chapa/initialize', { orderId });
        const url = payRes.data.checkoutUrl;
        if (url) { await clearCart(); window.location.href = url; }
      }
    } catch (err) {
      setApiError(err.response?.data?.error?.message || err.response?.data?.message || 'Checkout failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const placeOrderButton = (
    <button
      type="submit"
      disabled={submitting || !items.length}
      className="btn-primary w-full py-3.5 text-base"
    >
      {submitting ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Processing…
        </span>
      ) : (
        <>
          Place Order
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </>
      )}
    </button>
  );

  return (
    <div className="page-container">
      <h1 className="section-title mb-6">Checkout</h1>

      {apiError && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm" role="alert">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: shipping + payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping address */}
            <div className="card p-6">
              <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Shipping Address
              </h2>
              <div className="grid grid-cols-2 gap-4">
                {FIELDS.map(f => (
                  <div key={f.name} className={f.span === 2 ? 'col-span-2' : 'col-span-1'}>
                    <label htmlFor={f.name} className="label">{f.label}</label>
                    <input
                      id={f.name}
                      type="text"
                      value={address[f.name]}
                      onChange={e => setAddress(a => ({ ...a, [f.name]: e.target.value }))}
                      className={`input ${errors[f.name] ? 'border-red-400 focus:ring-red-400' : ''}`}
                    />
                    {errors[f.name] && <p className="text-red-500 text-xs mt-1">{errors[f.name]}</p>}
                  </div>
                ))}
              </div>
            </div>

            {/* Payment method */}
            <div className="card p-6">
              <h2 className="text-base font-bold text-slate-800 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                Payment Method
              </h2>
              <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} total={total} />
            </div>

            {/* Place Order button — below payment on mobile */}
            <div className="lg:hidden">
              {placeOrderButton}
              <p className="text-xs text-center text-slate-400 mt-2">🔒 Your payment is secured and encrypted</p>
            </div>
          </div>

          {/* Right: Order summary + Place Order — sticky on desktop */}
          <div className="hidden lg:block">
            <div className="sticky top-24 space-y-4">
              <OrderSummary items={items} shippingAddress={address} total={total} paymentMethod={paymentMethod} />
              {placeOrderButton}
              <p className="text-xs text-center text-slate-400">🔒 Your payment is secured and encrypted</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
