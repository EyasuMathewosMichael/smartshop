import OrderTracking from './OrderTracking';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700' },
  paid:      { label: 'Paid',      cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Shipped',   cls: 'bg-violet-100 text-violet-700' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-100 text-emerald-700' },
  failed:    { label: 'Failed',    cls: 'bg-red-100 text-red-700' },
};

export default function OrderDetail({ order }) {
  if (!order) return null;
  const addr = order.shippingAddress || {};
  const status = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, cls: 'bg-slate-100 text-slate-600' };
  const currencySymbol = order.currency === 'ETB' ? 'ETB ' : '$';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card p-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800">Order #{order.orderNumber}</h2>
          <p className="text-sm text-slate-400 mt-0.5">
            Placed {new Date(order.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`badge text-sm px-3 py-1 ${status.cls}`}>{status.label}</span>
      </div>

      {/* Tracking */}
      <OrderTracking order={order} />

      {/* Items */}
      <div className="card overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100">
          <h3 className="font-bold text-slate-800">Items Ordered</h3>
        </div>
        <div className="divide-y divide-slate-100">
          {(order.items || []).map((item, i) => (
            <div key={i} className="flex items-center gap-4 px-5 py-4">
              {item.image?.url ? (
                <img src={item.image.url} alt={item.name} className="w-14 h-14 object-cover rounded-xl bg-slate-100" />
              ) : (
                <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">Qty: {item.quantity} × {currencySymbol}{item.price?.toFixed(2)}</p>
              </div>
              <p className="text-sm font-bold text-slate-800 shrink-0">
                {currencySymbol}{(item.price * item.quantity).toFixed(2)}
              </p>
            </div>
          ))}
        </div>
        <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
          <span className="font-bold text-slate-700">Total</span>
          <span className="text-lg font-bold text-indigo-600">
            {order.currency === 'ETB' ? 'ETB ' : '$'}{order.total?.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Shipping */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Shipping Address
          </h3>
          <div className="text-sm text-slate-600 space-y-0.5">
            <p className="font-semibold text-slate-800">{addr.fullName}</p>
            <p>{addr.addressLine1}</p>
            {addr.addressLine2 && <p>{addr.addressLine2}</p>}
            <p>{addr.city}, {addr.state} {addr.postalCode}</p>
            <p>{addr.country}</p>
            {addr.phone && <p className="text-slate-400">{addr.phone}</p>}
          </div>
        </div>

        {/* Payment */}
        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
            <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
            Payment Info
          </h3>
          <div className="text-sm text-slate-600 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Method</span>
              <span className="font-semibold capitalize">{order.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status</span>
              <span className={`font-semibold capitalize ${order.paymentStatus === 'completed' ? 'text-emerald-600' : order.paymentStatus === 'failed' ? 'text-red-600' : 'text-amber-600'}`}>
                {order.paymentStatus}
              </span>
            </div>
            {order.paymentDetails?.paidAt && (
              <div className="flex justify-between">
                <span className="text-slate-400">Paid on</span>
                <span>{new Date(order.paymentDetails.paidAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
