import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { collections } from 'src/constants/collections';

@Schema({ collection: collections.bids, timestamps: true })
export class BidModel extends Document {
  @Prop({ required: true, unique: true })
  bidCode!: number;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: collections.users, required: true })
  userId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: collections.admin.auctions, required: true })
  auctionId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: Number, required: true, min: 0 })
  bidAmount?: number;
}

export const BidModelSchema = SchemaFactory.createForClass(BidModel);
