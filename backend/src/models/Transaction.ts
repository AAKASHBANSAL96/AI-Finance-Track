import { Schema, model } from 'mongoose';

export interface ITransaction {
  userId: string;
  statementId: string;
  date: Date;
  merchant: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  rawDescription?: string;
}

const TransactionSchema = new Schema<ITransaction>({
  userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
  statementId: { type: Schema.Types.ObjectId as any, ref: 'Statement', required: true },
  date: { type: Date, required: true },
  merchant: { type: String, required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['debit', 'credit'], required: true },
  category: { type: String, required: true },
  rawDescription: { type: String },
});

export default model<ITransaction>('Transaction', TransactionSchema);
