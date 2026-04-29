const STEPS = [
  { key: 'pending', label: 'Order Placed', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { key: 'paid', label: 'Payment Confirmed', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
  { key: 'shipped', label: 'Shipped', icon: 'M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4' },
  { key: 'delivered', label: 'Delivered', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
];

export default function OrderTracking({ order }) {
  const currentIndex = STEPS.findIndex(s => s.key === order.orderStatus);
  const history = order.statusHistory || [];

  function getTimestamp(stepKey) {
    const entry = history.find(h => h.status === stepKey);
    if (!entry) return null;
    return new Date(entry.timestamp).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  return (
    <div className="card p-5">
      <h3 className="text-sm font-bold text-slate-700 mb-5">Order Progress</h3>
      <div className="relative">
        {/* Progress line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-200">
          <div
            className="h-full bg-indigo-600 transition-all duration-500"
            style={{ width: currentIndex >= 0 ? `${(currentIndex / (STEPS.length - 1)) * 100}%` : '0%' }}
          />
        </div>

        <div className="relative flex justify-between">
          {STEPS.map((step, i) => {
            const completed = i <= currentIndex;
            const isCurrent = i === currentIndex;
            const ts = getTimestamp(step.key);

            return (
              <div key={step.key} className="flex flex-col items-center" style={{ width: `${100 / STEPS.length}%` }}>
                {/* Circle */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 transition-all ${
                  completed
                    ? 'bg-indigo-600 shadow-md shadow-indigo-200'
                    : 'bg-white border-2 border-slate-200'
                } ${isCurrent ? 'ring-4 ring-indigo-100' : ''}`}>
                  {completed ? (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={step.icon} />
                    </svg>
                  )}
                </div>

                {/* Label */}
                <div className="mt-2 text-center px-1">
                  <p className={`text-xs font-semibold ${completed ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {step.label}
                  </p>
                  {ts && <p className="text-[10px] text-slate-400 mt-0.5">{ts}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tracking info */}
      {order.trackingInfo?.trackingNumber && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-600">
          <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <span>{order.trackingInfo.carrier} — <strong>{order.trackingInfo.trackingNumber}</strong></span>
        </div>
      )}
    </div>
  );
}
