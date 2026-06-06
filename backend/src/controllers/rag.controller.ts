import { Request, Response, NextFunction } from 'express';
import { seedKnowledgeBaseDocuments } from '../services/rag.service';

export const seedKnowledgeBase = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });
    await seedKnowledgeBaseDocuments(req.user.id);
    res.json({ message: 'Knowledge base seeded successfully' });
  } catch (error) {
    next(error);
  }
};
