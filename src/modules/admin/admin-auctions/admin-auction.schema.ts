import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { auctionStatusEnum } from 'src/constants/admin/auction';
import { collections } from 'src/constants/collections';

export type AdminAuctionModelDocument = AdminAuctionModel & Document;

@Schema({ collection: collections.admin.auctions, timestamps: true })
export class AdminAuctionModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: collections.users })
  winnerId?: MongooseSchema.Types.ObjectId;

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: collections.admin.cars, required: true, unique: true })
  carId!: MongooseSchema.Types.ObjectId;

  @Prop({ required: true })
  startTime!: Date;

  @Prop({ required: true })
  endTime!: Date;

  @Prop({ required: true })
  startingBid!: number;

  @Prop({ default: 0 })
  currentHighestBid!: number;

  @Prop({ default: 'ACTIVE', enum: auctionStatusEnum })
  status!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId })
  updatedBy?: MongooseSchema.Types.ObjectId;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();

  @Prop({ default: Date.now })
  updatedAt: Date = new Date();
}

export const AdminAuctionModelSchema = SchemaFactory.createForClass(AdminAuctionModel);
