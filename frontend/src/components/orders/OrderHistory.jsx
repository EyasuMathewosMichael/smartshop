import { Link } from 'react-router-dom';
import Loader from '../common/Loader';

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   cls: 'bg-amber-100 text-amber-700' },
  paid:      { label: 'Paid',      cls: 'bg-blue-100 text-blue-700' },
  shipped:   { label: 'Shipped',   cls: 'bg-violet-100 text-violet-700' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-100 text-emerald-700' },
  failed:    { label: 'Failed',    cls: 'bg-red-100 text-red-700' },
};

export default function OrderHistory({ orders = [], loading = false }) {
  if (loading) return <Loader />;

  if (!orders.length) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-slate-600 font-semibold mb-1">No orders yet</p>
        <p className="text-slate-400 text-sm mb-5">Your order history will appear here.</p>
        <Link to="/products" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {orders.map(order => {
        const status = STATUS_CONFIG[order.orderStatus] || { label: order.orderStatus, cls: 'bg-slate-100 text-slate-600' };
        return (
          <Link
            key={order._id}
            to={`/orders/${order._id}`}
            className="card p-5 flex flex-wrap items-center justify-between gap-4 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-slate-800 text-sm">#{order.orderNumber}</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' · '}{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className={`badge ${status.cls}`}>{status.label}</span>
              <span className="font-bold text-slate-800">${order.total?.toFixed(2)}</span>
              <svg className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
