import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';
import Insight from '../models/Insight';

const buildAnalytics = async (userId: string) => {
  const transactions = await Transaction.find({ userId });
  const groupedByCategory = transactions.reduce<Record<string, number>>((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + tx.amount;
    return acc;
  }, {});

  const totalExpense = transactions.filter((tx) => tx.type === 'debit').reduce((sum, tx) => sum + tx.amount, 0);
  const totalIncome = transactions.filter((tx) => tx.type === 'credit').reduce((sum, tx) => sum + tx.amount, 0);

  const merchantCounts = transactions.reduce<Record<string, { total: number; count: number }>>((acc, tx) => {
    const key = tx.merchant.toLowerCase();
    if (!acc[key]) acc[key] = { total: 0, count: 0 };
    acc[key].total += tx.amount;
    acc[key].count += 1;
    return acc;
  }, {});

  const topMerchant = Object.entries(merchantCounts).sort((a, b) => b[1].total - a[1].total)[0]?.[0] || 'N/A';

  const savingRate = totalIncome > 0 ? Number(((totalIncome - totalExpense) / totalIncome).toFixed(2)) : 0;
  const healthScore = Math.round(Math.max(0, Math.min(100, 60 + savingRate * 40)));

  return {
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
    categoryBreakdown: groupedByCategory,
    topMerchant,
    healthScore,
  };
};

export const getDashboardAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const analytics = await buildAnalytics(req.user.id);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const getInsights = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const insights = await Insight.find({ userId: req.user.id }).sort({ createdAt: -1 }).limit(6);
    res.json({ insights });
  } catch (error) {
    next(error);
  }
};
