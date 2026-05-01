import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('order_id') || searchParams.get('order');
  const txRef = searchParams.get('trx_ref') || searchParams.get('tx_ref');

  const [verifying, setVerifying] = useState(!!txRef);
  const [verifyError, setVerifyError] = useState(null);

  useEffect(() => {
    if (!txRef) return;

    async function verifyChapa() {
      try {
        await api.post('/payments/chapa/verify', { txRef });
      } catch (err) {
        // Non-fatal — order may already be confirmed via webhook
        console.error('Chapa verify error:', err);
        setVerifyError('Payment verification is taking longer than expected. Your order will be confirmed shortly.');
      } finally {
        setVerifying(false);
      }
    }

    verifyChapa();
  }, [txRef]);

  if (verifying) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-6" />
        <p className="text-slate-500">Confirming your payment…</p>
      </div>
    );
  }

  return (
    <div className="text-center py-16 px-4">
      {/* Success icon */}
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-3xl font-bold text-slate-800 mb-2">Order Confirmed!</h1>
      <p className="text-slate-500 mb-2">Thank you for your purchase.</p>
      {orderId && (
        <p className="text-sm text-slate-400 mb-4">
          Order ID: <span className="font-mono font-semibold text-slate-600">{orderId}</span>
        </p>
      )}
      {verifyError && (
        <p className="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4 max-w-sm mx-auto">
          {verifyError}
        </p>
      )}
      <p className="text-slate-500 text-sm mb-8 max-w-sm mx-auto">
        We'll send you a confirmation email shortly. You can track your order in your order history.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/orders" className="btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          View My Orders
        </Link>
        <Link to="/products" className="btn-secondary">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
