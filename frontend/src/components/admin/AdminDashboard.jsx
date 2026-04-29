import { useState, useEffect } from 'react';
import api from '../../utils/api';
import AnalyticsCharts from './AnalyticsCharts';
import Loader from '../common/Loader';

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-white rounded-lg shadow p-4">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-bold text-gray-800 mt-1">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function AdminDashboard() {
  const today = new Date().toISOString().split('T')[0];
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({});
  const [revenueData, setRevenueData] = useState([]);
  const [orderStats, setOrderStats] = useState({});
  const [topProducts, setTopProducts] = useState([]);

  useEffect(() => {
    fetchAnalytics();
  }, [startDate, endDate]);

  async function fetchAnalytics() {
    setLoading(true);
    const params = { startDate, endDate };
    try {
      const [revenueRes, ordersRes, trendsRes, topRes] = await Promise.allSettled([
        api.get('/admin/analytics/revenue', { params }),
        api.get('/admin/analytics/orders', { params }),
        api.get('/admin/analytics/trends', { params }),
        api.get('/admin/analytics/top-products', { params })
      ]);

      if (revenueRes.status === 'fulfilled') setStats(revenueRes.value.data || {});
      if (ordersRes.status === 'fulfilled') setOrderStats(ordersRes.value.data || {});
      if (trendsRes.status === 'fulfilled') setRevenueData(trendsRes.value.data?.trends || trendsRes.value.data || []);
      if (topRes.status === 'fulfilled') setTopProducts(topRes.value.data?.products || topRes.value.data || []);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Date range */}
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <label htmlFor="startDate" className="block text-xs font-medium text-gray-600 mb-1">From</label>
          <input
            id="startDate"
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="endDate" className="block text-xs font-medium text-gray-600 mb-1">To</label>
          <input
            id="endDate"
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border border-gray-300 rounded px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? <Loader /> : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Total Revenue"
              value={`$${(stats.totalRevenue || 0).toFixed(2)}`}
            />
            <StatCard
              label="Total Orders"
              value={orderStats.total || 0}
            />
            <StatCard
              label="Avg Order Value"
              value={`$${(stats.averageOrderValue || 0).toFixed(2)}`}
            />
            <StatCard
              label="New Customers"
              value={stats.newCustomers || 0}
            />
          </div>

          {/* Charts */}
          <AnalyticsCharts
            revenueData={revenueData}
            orderStats={orderStats}
            topProducts={topProducts}
          />
        </>
      )}
    </div>
  );
}
