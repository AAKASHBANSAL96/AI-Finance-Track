import { Schema, model } from 'mongoose';

export interface IInsight {
  userId: string;
  month: number;
  year: number;
  insight: string;
  createdAt: Date;
}

const InsightSchema = new Schema<IInsight>({
  userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  insight: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default model<IInsight>('Insight', InsightSchema);
