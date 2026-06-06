import { Request, Response, NextFunction } from 'express';
import Transaction from '../models/Transaction';

export const listTransactions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const { page = '1', limit = '25', category, merchant, type } = req.query;
    const query: any = { userId: req.user.id };
    if (category) query.category = category;
    if (merchant) query.merchant = { $regex: merchant, $options: 'i' };
    if (type) query.type = type;

    const pageNum = Number(page);
    const pageSize = Number(limit);

    const transactions = await Transaction.find(query)
      .sort({ date: -1 })
      .skip((pageNum - 1) * pageSize)
      .limit(pageSize);

    const total = await Transaction.countDocuments(query);
    res.json({ transactions, total, page: pageNum, limit: pageSize });
  } catch (error) {
    next(error);
  }
};
