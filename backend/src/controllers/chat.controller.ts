import { Request, Response, NextFunction } from 'express';
import { getFinancialContext } from '../services/analytics.service';
import { askLocalLLM } from '../services/llm.service';
import { searchKnowledgeBase } from '../services/rag.service';

export const sendChatQuery = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

    const { prompt } = req.body;
    if (!prompt || typeof prompt !== 'string') return res.status(400).json({ message: 'Prompt is required' });

    const context = await getFinancialContext(req.user.id);
    const retrieved = await searchKnowledgeBase(prompt, req.user.id).catch(() => []);
    const retrievedContext = retrieved
      .map((item) => item.payload?.content)
      .filter(Boolean)
      .join('\n\n');
    const defaultSystem = `You are a local finance copilot helping the user answer questions using their private financial data and a local knowledge base.`;
    const fullPrompt = `${defaultSystem}\n\nUser question: ${prompt}\n\nAnalytics context:\n${context}\n\nRetrieved statement context:\n${retrievedContext}`;

    const reply = await askLocalLLM(fullPrompt);
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};
