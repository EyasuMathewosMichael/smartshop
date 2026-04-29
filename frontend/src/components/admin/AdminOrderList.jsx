import { useState, useEffect } from 'react';
import api from '../../utils/api';
import OrderStatusUpdater from './OrderStatusUpdater';
import Modal from '../common/Modal';
import Pagination from '../common/Pagination';
import Loader from '../common/Loader';

const ORDER_STATUSES = ['', 'pending', 'paid', 'shipped', 'delivered'];
const PAYMENT_STATUSES = ['', 'pending', 'completed', 'failed'];

const STATUS_COLORS = {
  pending:   'bg-amber-100 text-amber-700',
  paid:      'bg-blue-100 text-blue-700',
  shipped:   'bg-violet-100 text-violet-700',
  delivered: 'bg-emerald-100 text-emerald-700',
  completed: 'bg-emerald-100 text-emerald-700',
  failed:    'bg-red-100 text-red-700',
};

export default function AdminOrderList() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [orderStatus, setOrderStatus] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => { fetchOrders(); }, [page, orderStatus, paymentStatus]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = { page, limit: 10 };
      if (orderStatus) params.orderStatus = orderStatus;
      if (paymentStatus) params.paymentStatus = paymentStatus;
      const res = await api.get('/admin/orders', { params });
      setOrders(res.data.orders || res.data.data || []);
      setTotalPages(res.data.totalPages || res.data.pages || 1);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-slate-800">Orders</h2>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <select
          value={orderStatus}
          onChange={e => { setOrderStatus(e.target.value); setPage(1); }}
          className="input w-auto"
          aria-label="Filter by order status"
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Statuses'}</option>
          ))}
        </select>
        <select
          value={paymentStatus}
          onChange={e => { setPaymentStatus(e.target.value); setPage(1); }}
          className="input w-auto"
          aria-label="Filter by payment status"
        >
          {PAYMENT_STATUSES.map(s => (
            <option key={s} value={s}>{s ? s.charAt(0).toUpperCase() + s.slice(1) : 'All Payments'}</option>
          ))}
        </select>
      </div>

      {loading ? <Loader /> : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-x-auto">
          <table className="min-w-full text-sm whitespace-nowrap">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Order #</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden md:table-cell">Customer</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Date</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Total</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Status</th>
                <th className="text-left px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide hidden sm:table-cell">Payment</th>
                <th className="text-right px-5 py-3.5 font-semibold text-slate-500 text-xs uppercase tracking-wide">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map(order => (
                <tr key={order._id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-semibold text-slate-800">#{order.orderNumber}</td>
                  <td className="px-5 py-4 text-slate-600 hidden md:table-cell">{order.userId?.name || order.userId?.email || '—'}</td>
                  <td className="px-5 py-4 text-slate-500 text-xs hidden sm:table-cell">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                  <td className="px-5 py-4 text-right font-bold text-slate-800">${order.total?.toFixed(2)}</td>
                  <td className="px-5 py-4">
                    <span className={`badge ${STATUS_COLORS[order.orderStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {order.orderStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 hidden sm:table-cell">
                    <span className={`badge ${STATUS_COLORS[order.paymentStatus] || 'bg-slate-100 text-slate-600'}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
              {!orders.length && (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <svg className="w-10 h-10 mx-auto mb-2 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Update Order #${selectedOrder?.orderNumber}`}
      >
        {selectedOrder && (
          <OrderStatusUpdater
            order={selectedOrder}
            onUpdated={() => { setSelectedOrder(null); fetchOrders(); }}
          />
        )}
      </Modal>
    </div>
  );
}
