import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { collections } from 'src/constants/collections';

export type AdminUserTypesModelDocument = AdminUserTypesModel & Document;

@Schema({ collection: collections.admin.userTypes })
export class AdminUserTypesModel {
  @Prop({ default: '' })
  userTypeName: string = '';

  @Prop({ default: '' })
  slug: string = '';

  @Prop({ required: [true, 'Status is required'], default: '1' })
  status!: string;

  @Prop({ type: MongooseSchema.Types.ObjectId, required: [true, 'Created by is required'], })
  createdBy!: MongooseSchema.Types.ObjectId;

  @Prop()
  createdAt: Date = new Date();

  @Prop({ default: Date.now })
  updatedAt: Date = new Date();
}

export const AdminUserTypesModelSchema = SchemaFactory.createForClass(AdminUserTypesModel);
