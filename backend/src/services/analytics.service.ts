import Transaction from '../models/Transaction';

export const getFinancialContext = async (userId: string) => {
  const transactions = await Transaction.find({ userId }).sort({ date: -1 }).limit(50);
  const totalExpense = transactions.filter((tx) => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = transactions.filter((tx) => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);

  const categoryTotals = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  return `Total income: ${totalIncome}\nTotal expense: ${totalExpense}\nRecent transactions:\n${transactions
    .slice(0, 12)
    .map((tx) => `${tx.date.toISOString().slice(0, 10)} | ${tx.merchant} | ${tx.category} | ${tx.type} | ${tx.amount}`)
    .join('\n')}\nCategory totals: ${JSON.stringify(categoryTotals)}`;
};
