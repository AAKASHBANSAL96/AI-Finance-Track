import Transaction from '../models/Transaction';
import { classifyMerchant } from './category.service';
import { askLocalLLM, askVisionLLM } from './llm.service';
import fs from 'fs/promises';
import os from 'os';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';

interface ExtractedTransaction {
  transactionDate: string;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
}

const MAX_EXTRACTION_CHARS = 16000;
const MAX_VISION_PAGES = 5;
const MIN_CONFIDENT_TABLE_ROWS = 10;
const execFileAsync = promisify(execFile);

const normalizeDate = (value: unknown): string => {
  if (!value) return '';
  const raw = String(value).trim();
  const parsed = new Date(raw);
  if (!Number.isNaN(parsed.getTime())) return parsed.toISOString();

  const match = raw.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
  if (!match) return '';

  const [, day, month, year] = match;
  const fullYear = year.length === 2 ? `20${year}` : year;
  const iso = `${fullYear}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : date.toISOString();
};

const normalizeMerchant = (item: Record<string, unknown>): string => {
  const merchant = item.merchant ?? item.description ?? item.narration ?? item.payee;
  if (merchant) return String(merchant).trim();

  const sender = item.sender ? String(item.sender).trim() : '';
  const receiver = item.receiver ? String(item.receiver).trim() : '';
  return [sender, receiver].filter(Boolean).join(' to ');
};

const normalizeType = (item: Record<string, unknown>, amount: number): ExtractedTransaction['type'] => {
  if (item.type === 'credit' || item.type === 'debit') return item.type;
  if (item.credit || item.deposit) return 'credit';
  if (item.debit || item.withdrawal) return 'debit';
  return amount < 0 ? 'debit' : 'credit';
};

const moneyPattern = /-?\d{1,3}(?:,\d{3})*(?:\.\d{1,2})|-?\d+\.\d{1,2}/g;

const parseMoney = (value: string): number => Number(value.replace(/,/g, ''));

const countMoneyValues = (value: string): number => [...value.matchAll(moneyPattern)].length;

const parseStatementTableText = (text: string): ExtractedTransaction[] => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, ' ').trim())
    .filter(Boolean);

  const rows: string[] = [];
  let current = '';

  for (const line of lines) {
    const startsWithDate = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/.test(line);
    const isOnlyDate = /^\d{1,2}[/-]\d{1,2}[/-]\d{2,4}$/.test(line);

    if (startsWithDate && (!current || !isOnlyDate || countMoneyValues(current) >= 2)) {
      if (current) rows.push(current);
      current = line;
    } else if (current) {
      current = `${current} ${line}`;
    }
  }
  if (current) rows.push(current);

  let previousClosing: number | null = null;

  return rows
    .map((row) => {
      const dateMatch = row.match(/^(\d{1,2}[/-]\d{1,2}[/-]\d{2,4})\b/);
      const moneyMatches = [...row.matchAll(moneyPattern)].map((match) => ({
        value: parseMoney(match[0]),
        index: match.index ?? -1,
      }));

      if (!dateMatch || moneyMatches.length < 2) return null;

      const closingBalance = moneyMatches[moneyMatches.length - 1].value;
      const amountToken = moneyMatches[moneyMatches.length - 2];
      const amount = Math.abs(amountToken.value);
      const transactionDate = normalizeDate(dateMatch[1]);
      const narrationStart = dateMatch[0].length;
      const narrationEnd = amountToken.index > narrationStart ? amountToken.index : row.length;
      const merchant = row
        .slice(narrationStart, narrationEnd)
        .replace(/\b\d{12,}\b/g, '')
        .replace(/\b\d{1,2}[/-]\d{1,2}[/-]\d{2,4}\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

      const balanceDelta = previousClosing === null ? null : closingBalance - previousClosing;
      previousClosing = closingBalance;

      return {
        transactionDate,
        merchant,
        amount,
        type: balanceDelta !== null ? (balanceDelta >= 0 ? 'credit' : 'debit') : 'debit',
      } satisfies ExtractedTransaction;
    })
    .filter((item): item is ExtractedTransaction => Boolean(item?.transactionDate && item.merchant && item.amount > 0));
};

const parseLLMResponse = (text: string): ExtractedTransaction[] => {
  try {
    const withoutThinkBlocks = text.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
    const withoutCodeFence = withoutThinkBlocks
      .replace(/^```(?:json)?/i, '')
      .replace(/```$/i, '')
      .trim();
    const objectStart = withoutCodeFence.indexOf('{');
    const objectEnd = withoutCodeFence.lastIndexOf('}');
    const arrayStart = withoutCodeFence.indexOf('[');
    const arrayEnd = withoutCodeFence.lastIndexOf(']');
    const json =
      arrayStart >= 0 && arrayEnd > arrayStart
        ? withoutCodeFence.slice(arrayStart, arrayEnd + 1)
        : objectStart >= 0 && objectEnd > objectStart
          ? withoutCodeFence.slice(objectStart, objectEnd + 1)
        : withoutCodeFence;
    const parsed = JSON.parse(json);
    const items = Array.isArray(parsed) ? parsed : parsed.transactions;
    if (!Array.isArray(items)) throw new Error('No transactions array');
    return items
      .map((item) => {
        const amount = Number(item.amount);
        return {
          transactionDate: normalizeDate(item.transactionDate ?? item.date ?? item.valueDate),
          merchant: normalizeMerchant(item),
          amount: Math.abs(amount),
          type: normalizeType(item, amount),
        };
      })
      .filter(
        (item) =>
          item.transactionDate &&
          item.merchant &&
          Number.isFinite(item.amount) &&
          item.amount > 0 &&
          !Number.isNaN(new Date(item.transactionDate).getTime()),
      );
  } catch (error) {
    return [];
  }
};

const renderPdfPagesToBase64Images = async (filePath: string): Promise<string[]> => {
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'statement-pages-'));
  const outputPrefix = path.join(tempDir, 'page');

  try {
    await execFileAsync('pdftoppm', ['-png', '-r', '180', '-f', '1', '-l', String(MAX_VISION_PAGES), filePath, outputPrefix]);
    const files = (await fs.readdir(tempDir))
      .filter((file) => file.toLowerCase().endsWith('.png'))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return Promise.all(files.map(async (file) => fs.readFile(path.join(tempDir, file), 'base64')));
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => undefined);
  }
};

const extractTransactionsFromPdfImages = async (filePath: string): Promise<ExtractedTransaction[]> => {
  const images = await renderPdfPagesToBase64Images(filePath);
  if (images.length === 0) return [];

  const prompt = `You are reading bank statement page images.
Extract every visible transaction row from the table.
Return ONLY valid JSON matching this shape:
{
  "transactions": [
    {
      "transactionDate": "YYYY-MM-DD",
      "merchant": "full narration text",
      "amount": 0,
      "type": "debit"
    }
  ]
}

Rules:
- Read all rows on all provided page images.
- Join wrapped narration lines into one merchant string.
- Use Withdrawal Amt. as "debit".
- Use Deposit Amt. as "credit".
- Do not include opening balance, closing balance, totals, or page headers.
- Convert dates like 01/12/24 to ISO format.
- Amount must be positive.`;

  const rawResponse = await askVisionLLM(prompt, images, { format: 'json', numPredict: 5000 });
  return parseLLMResponse(rawResponse);
};

export const createTransactionsFromText = async (
  userId: string,
  statementId: string,
  text: string,
  sourceFilePath?: string,
) => {
  const extractionText = text.slice(0, MAX_EXTRACTION_CHARS);
  console.log({extractionText});
  
  const tableParsed = parseStatementTableText(text);
  if (tableParsed.length >= MIN_CONFIDENT_TABLE_ROWS || (tableParsed.length > 0 && !sourceFilePath)) {
    return saveExtractedTransactions(userId, statementId, text, tableParsed);
  }

  const prompt = `You are a bank statement transaction extraction engine.
Return ONLY valid JSON matching this exact shape:
{
  "transactions": [
    {
      "transactionDate": "YYYY-MM-DD",
      "merchant": "transaction description",
      "amount": 0,
      "type": "debit"
    }
  ]
}

Rules:
- Extract individual transaction rows only.
- Do not summarize balances, totals, or statement key points.
- Do not include opening balance, closing balance, total debits, or total credits as transactions.
- Use "credit" only for money coming into the account. Use "debit" only for money going out.
- Convert dates to ISO format.
- If no transaction rows are present, return {"transactions":[]}.

Bank statement text:
${extractionText}`;
  const rawResponse = await askLocalLLM(prompt, { format: 'json', numPredict: 2000 });
  const parsed = parseLLMResponse(rawResponse);

  if (parsed.length === 0) {
    console.error('Failed to parse transaction extraction response:', rawResponse.slice(0, 1000));
    if (sourceFilePath) {
      const visionParsed = await extractTransactionsFromPdfImages(sourceFilePath).catch((error) => {
        console.error('Failed to extract transactions from PDF page images:', error);
        return [];
      });

      if (visionParsed.length > 0) {
        return saveExtractedTransactions(userId, statementId, text, visionParsed);
      }
    }

    if (tableParsed.length > 0) {
      return saveExtractedTransactions(userId, statementId, text, tableParsed);
    }

    throw new Error('Failed to extract transactions from statement content');
  }

  if (sourceFilePath && Math.max(tableParsed.length, parsed.length) < MIN_CONFIDENT_TABLE_ROWS) {
    const visionParsed = await extractTransactionsFromPdfImages(sourceFilePath).catch((error) => {
      console.error('Failed to extract transactions from PDF page images:', error);
      return [];
    });
    const bestParsed = [tableParsed, parsed, visionParsed].sort((a, b) => b.length - a.length)[0];
    return saveExtractedTransactions(userId, statementId, text, bestParsed);
  }

  return saveExtractedTransactions(userId, statementId, text, parsed.length >= tableParsed.length ? parsed : tableParsed);
};

const saveExtractedTransactions = async (
  userId: string,
  statementId: string,
  text: string,
  parsed: ExtractedTransaction[],
) => {
  const transactions = await Promise.all(
    parsed.map(async (item) => {
      const category = classifyMerchant(item.merchant);
      const transaction = await Transaction.create({
        userId,
        statementId,
        date: new Date(item.transactionDate),
        merchant: item.merchant || 'Unknown',
        amount: item.amount,
        type: item.type,
        category,
        rawDescription: text.slice(0, 120),
      });
      return transaction;
    }),
  );

  return transactions;
};
