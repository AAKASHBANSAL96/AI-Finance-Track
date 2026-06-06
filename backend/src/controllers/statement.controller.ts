import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import Statement from '../models/Statement';
import { extractStatementData } from '../services/pdf.service';
import { maskSensitiveData } from '../services/mask.service';
import { createTransactionsFromText } from '../services/transaction.service';
import { indexStatementKnowledge } from '../services/rag.service';

export const uploadStatement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file || !req.user) return res.status(400).json({ message: 'File upload failed' });

    const text = await extractStatementData(req.file.path);
    const maskedText = maskSensitiveData(text);

    const month = new Date().getMonth() + 1;
    const year = new Date().getFullYear();

    const statement = await Statement.create({
      userId: req.user.id,
      fileName: req.file.filename,
      month,
      year,
      uploadDate: new Date(),
    });

    const transactions = await createTransactionsFromText(req.user.id, statement.id, maskedText, req.file.path);
    indexStatementKnowledge(req.user.id, statement.id, maskedText).catch((error) => {
      console.error('Failed to index statement knowledge:', error);
    });

    res.status(201).json({ statement, transactions });
  } catch (error) {
    next(error);
  }
};

export const getUploadHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    const history = await Statement.find({ userId: req.user.id }).sort({ uploadDate: -1 });
    res.json({ history });
  } catch (error) {
    next(error);
  }
};
