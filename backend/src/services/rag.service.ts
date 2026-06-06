import { QdrantClient } from '@qdrant/js-client-rest';
import crypto from 'crypto';
import config from '../config';
import Transaction from '../models/Transaction';
import { createEmbedding } from './llm.service';

const qdrant = new QdrantClient({ url: config.qdrantUrl });
const VECTOR_SIZE = 768;

const documents = [
  {
    id: 'budgeting',
    text: 'Create a monthly budget by tracking income, expenses, savings goals, and recurring payments. Allocate 50% for needs, 30% for wants, and 20% to savings.',
  },
  {
    id: 'emergency_fund',
    text: 'An emergency fund should cover 3-6 months of essential living costs. Keep it in a liquid savings account separate from daily spending.',
  },
  {
    id: 'tax_basics',
    text: 'Understand deductions, tax brackets, and the benefits of saving in retirement accounts to reduce taxable income. Keep records of receipts and investment statements.',
  },
  {
    id: 'debt_management',
    text: 'Pay high-interest debt first, negotiate lower rates, and maintain timely payments. Use a debt snowball or avalanche method to accelerate payoff.',
  },
  {
    id: 'investment_rules',
    text: 'Diversify investments across asset classes, automate contributions, and rebalance periodically. Keep a long-term view and avoid emotional trading.',
  },
];

const ensureKnowledgeCollection = async () => {
  const existing = await qdrant.getCollection(config.qdrantCollection).catch(() => null);
  if (!existing) {
    await qdrant.createCollection(config.qdrantCollection, {
      vectors: { size: VECTOR_SIZE, distance: 'Cosine' },
    });
  }
};

const toPointId = (seed: string) => {
  const hash = crypto.createHash('sha256').update(seed).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-${hash.slice(12, 16)}-${hash.slice(16, 20)}-${hash.slice(20, 32)}`;
};

const chunkText = (text: string, chunkSize = 1800, overlap = 200) => {
  const clean = text.replace(/\s+/g, ' ').trim();
  const chunks: string[] = [];

  for (let start = 0; start < clean.length; start += chunkSize - overlap) {
    const chunk = clean.slice(start, start + chunkSize).trim();
    if (chunk) chunks.push(chunk);
  }

  return chunks;
};

export const seedKnowledgeBaseDocuments = async (userId: string) => {
  await ensureKnowledgeCollection();

  const points = await Promise.all(
    documents.map(async (doc) => {
      const embedding = await createEmbedding(doc.text);
      return {
        id: toPointId(`${userId}-${doc.id}`),
        vector: embedding,
        payload: {
          userId,
          content: doc.text,
          title: doc.id,
          source: 'finance_guide',
        },
      };
    }),
  );

  await qdrant.upsert(config.qdrantCollection, { points });
};

export const indexStatementKnowledge = async (
  userId: string,
  statementId: string,
  statementText: string,
) => {
  await ensureKnowledgeCollection();

  const transactions = await Transaction.find({ userId, statementId }).sort({ date: 1 });
  const transactionSummary = transactions
    .map((tx) => `${tx.date.toISOString().slice(0, 10)} | ${tx.type} | ${tx.amount} | ${tx.merchant} | ${tx.category}`)
    .join('\n');
  const chunks = chunkText(`Extracted transactions:\n${transactionSummary}\n\nRaw statement text:\n${statementText}`);

  const points = await Promise.all(
    chunks.map(async (chunk, index) => ({
      id: toPointId(`${userId}-${statementId}-${index}`),
      vector: await createEmbedding(chunk),
      payload: {
        userId,
        statementId,
        content: chunk,
        title: `statement_${statementId}_${index + 1}`,
        source: 'bank_statement',
      },
    })),
  );

  if (points.length > 0) {
    await qdrant.upsert(config.qdrantCollection, { points });
  }
};

export const searchKnowledgeBase = async (query: string, userId?: string) => {
  await ensureKnowledgeCollection();

  const embedding = await createEmbedding(query);
  return qdrant.search(config.qdrantCollection, {
    vector: embedding,
    limit: 5,
    ...(userId
      ? {
          filter: {
            must: [{ key: 'userId', match: { value: userId } }],
          },
        }
      : {}),
  });
};
