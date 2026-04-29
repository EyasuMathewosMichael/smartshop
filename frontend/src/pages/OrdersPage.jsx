import { useState, useEffect } from 'react';
import api from '../utils/api';
import OrderHistory from '../components/orders/OrderHistory';

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders')
      .then(res => setOrders(res.data.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="page-container max-w-4xl">
      <div className="mb-6">
        <h1 className="section-title">My Orders</h1>
        {!loading && orders.length > 0 && (
          <p className="text-slate-500 text-sm mt-1">{orders.length} order{orders.length !== 1 ? 's' : ''}</p>
        )}
      </div>
      <OrderHistory orders={orders} loading={loading} />
    </div>
  );
}
