import { Schema, model } from 'mongoose';

export interface IStatement {
  userId: string;
  fileName: string;
  month: number;
  year: number;
  uploadDate: Date;
}

const StatementSchema = new Schema<IStatement>({
  userId: { type: Schema.Types.ObjectId as any, ref: 'User', required: true },
  fileName: { type: String, required: true },
  month: { type: Number, required: true },
  year: { type: Number, required: true },
  uploadDate: { type: Date, default: Date.now },
});

export default model<IStatement>('Statement', StatementSchema);
