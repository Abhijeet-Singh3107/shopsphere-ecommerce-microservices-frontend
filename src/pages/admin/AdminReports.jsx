import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getReports } from '../../api/endpoints.js';
import StatCard from '../../components/admin/StatCard.jsx';
import LoadingSpinner from '../../components/common/LoadingSpinner.jsx';
import { useNotification } from '../../hooks/useNotification.js';
import { formatINR } from '../../utils/currency.js';

function toChartData(obj) {
  if (!obj || typeof obj !== 'object') return [];
  return Object.entries(obj).map(([status, value]) => ({ status, value: Number(value) }));
}

export default function AdminReports() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const { notify } = useNotification();

  useEffect(() => {
    getReports()
      .then(setReport)
      .catch((err) => notify(err.message ?? 'Failed to load reports', 'error'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner />;

  const ordersByStatusData = toChartData(report?.ordersByStatus);
  const revenueByStatusData = toChartData(report?.revenueByStatus);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Reports</h1>

      {/* Summary */}
      <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Total Revenue" value={formatINR(report?.totalRevenue ?? 0)} />
        <StatCard label="Total Orders" value={report?.totalOrders ?? 0} />
        <StatCard label="Average Order Value" value={formatINR(report?.averageOrderValue ?? 0)} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <ChartCard title="Orders by Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={ordersByStatusData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Revenue by Status">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenueByStatusData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatINR(v)} />
              <Tooltip formatter={(v) => formatINR(v)} />
              <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-base font-semibold text-gray-800">{title}</h2>
      {children}
    </div>
  );
}
