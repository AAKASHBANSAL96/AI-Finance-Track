import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import config from '../config';

interface AuthRequest extends Request {
  user?: { id: string };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const auth = req.headers.authorization;
    if (!auth?.startsWith('Bearer ')) return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.slice(7);
    const payload = jwt.verify(token, config.jwtSecret) as { userId: string };
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'Unauthorized' });
    req.user = { id: user.id };
    next();
  } catch (error) {
    next(error);
  }
};
