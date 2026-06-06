import { useEffect, useState } from 'react';
import { fetchTransactions } from '../services/transactions';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadTransactions = async () => {
    setIsLoading(true);
    const data = await fetchTransactions({ page: 1, limit: 50 });
    setTransactions(data.transactions || []);
    setIsLoading(false);
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-semibold">Transactions</h1>
        <p className="mt-2 text-sm text-slate-500">Browse your imported expenses and income records.</p>
      </div>
      <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Date</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Merchant</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Category</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Type</th>
              <th className="px-4 py-3 text-sm font-semibold text-slate-700">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">Loading transactions...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-6 text-center">No transactions available.</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx._id}>
                  <td className="px-4 py-4 text-sm text-slate-700">{new Date(tx.date).toLocaleDateString()}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{tx.merchant}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{tx.category}</td>
                  <td className="px-4 py-4 text-sm text-slate-700">{tx.type}</td>
                  <td className="px-4 py-4 text-sm font-semibold text-slate-900">₹{tx.amount}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsPage;
