import { Schema, model, Document } from 'mongoose';
import { collections } from 'src/constants/collections';

export interface Sequence extends Document {
  _id: string;
  sequenceValue: number;
}

export const SequenceSchema = new Schema<Sequence>({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});

export const SequenceModel = model<Sequence>(collections.common.sequences, SequenceSchema);

export type SequenceDocument = Sequence & Document;
