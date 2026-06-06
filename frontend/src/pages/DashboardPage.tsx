import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { fetchDashboardAnalytics } from '../services/analytics';

const COLORS = ['#3b82f6', '#f97316', '#10b981', '#ef4444', '#8b5cf6', '#14b8a6'];

interface DashboardData {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  categoryBreakdown: Record<string, number>;
  healthScore: number;
}

const DashboardPage = () => {
  const { data, isLoading } = useQuery<DashboardData>({
    queryKey: ['dashboardAnalytics'],
    queryFn: fetchDashboardAnalytics,
  });

  const categories = data?.categoryBreakdown
    ? Object.entries(data.categoryBreakdown).map(([name, value]) => ({ name, value }))
    : [];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Total Income</h2>
          <p className="mt-4 text-3xl font-bold">₹{data?.totalIncome ?? '0'}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Total Expense</h2>
          <p className="mt-4 text-3xl font-bold">₹{data?.totalExpense ?? '0'}</p>
        </div>
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase text-slate-500">Net Savings</h2>
          <p className="mt-4 text-3xl font-bold">₹{data?.netSavings ?? '0'}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-3xl bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold">Category breakdown</h2>
          {isLoading ? (
            <p>Loading chart...</p>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categories} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                    {categories.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
        <div className="space-y-4 rounded-3xl bg-white p-6 shadow-sm">
          <div>
            <h2 className="text-xl font-semibold">Financial health</h2>
            <p className="mt-2 text-sm text-slate-500">A local snapshot of your current money habits.</p>
          </div>
          <div className="rounded-3xl bg-slate-950 p-6 text-white">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-300">Health Score</p>
            <p className="mt-4 text-5xl font-bold">{data?.healthScore ?? 0}</p>
            <p className="mt-2 text-slate-300">Stronger savings and a stable expense ratio deliver a higher score.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
