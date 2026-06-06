import { useQuery } from '@tanstack/react-query';
import { fetchInsights } from '../services/analytics';

interface InsightItem {
  _id: string;
  insight: string;
  createdAt: string;
}

const InsightsPage = () => {
  const { data: insights = [], isLoading } = useQuery<InsightItem[]>({
    queryKey: ['insights'],
    queryFn: fetchInsights,
  });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">AI Insights</h1>
        <p className="mt-2 text-sm text-slate-500">Review automated suggestions generated from your spending habits.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {isLoading ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm">Loading insights...</div>
        ) : insights.length === 0 ? (
          <div className="rounded-3xl bg-white p-6 shadow-sm">No insights found yet. Upload statements and seed the knowledge base to generate recommendations.</div>
        ) : (
          insights.map((item: any) => (
            <div key={item._id} className="rounded-3xl bg-white p-6 shadow-sm">
              <p className="text-sm text-slate-500">{new Date(item.createdAt).toLocaleDateString()}</p>
              <p className="mt-3 text-lg font-semibold">{item.insight}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default InsightsPage;
