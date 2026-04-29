import { useState } from 'react';
import api from '../../utils/api';

const ORDER_STATUSES = ['pending', 'paid', 'shipped', 'delivered'];

export default function OrderStatusUpdater({ order, onUpdated }) {
  const [status, setStatus] = useState(order.orderStatus);
  const [carrier, setCarrier] = useState(order.trackingInfo?.carrier || '');
  const [trackingNumber, setTrackingNumber] = useState(order.trackingInfo?.trackingNumber || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { orderStatus: status };
      if (status === 'shipped') {
        payload.trackingInfo = { carrier, trackingNumber };
      }
      await api.put(`/admin/orders/${order._id}`, payload);
      onUpdated?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <p className="text-red-600 text-xs">{error}</p>}

      <div>
        <label htmlFor={`status-${order._id}`} className="block text-xs font-medium text-gray-600 mb-1">
          Order Status
        </label>
        <select
          id={`status-${order._id}`}
          value={status}
          onChange={e => setStatus(e.target.value)}
          className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {ORDER_STATUSES.map(s => (
            <option key={s} value={s} className="capitalize">{s}</option>
          ))}
        </select>
      </div>

      {status === 'shipped' && (
        <div className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Carrier</label>
            <input
              type="text"
              value={carrier}
              onChange={e => setCarrier(e.target.value)}
              placeholder="e.g. FedEx, UPS"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="Tracking number"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {saving ? 'Updating…' : 'Update Status'}
      </button>
    </form>
  );
}
