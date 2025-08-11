import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { collections } from 'src/constants/collections';
import { AdminUserTypesModel } from '../admin/user-types/admin-user-types.schema';

export type UserModelDocument = UserModel & Document;

@Schema({ collection: collections.users, timestamps: true })
export class UserModel {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: AdminUserTypesModel.name, required: false, default: null })
  userTypeId?: MongooseSchema.Types.ObjectId;

  @Prop({ required: true, unique: true })
  userCode!: number;

  @Prop({ required: true })
  username!: string;

  @Prop({ required: true, unique: true, match: [/\S+@\S+\.\S+/, 'Email format is invalid'] })
  email!: string;

  @Prop()
  phone?: string;

  @Prop({ required: true })
  password!: string;

  @Prop({ default: 'ACTIVE', enum: ['ACTIVE', 'INACTIVE', 'BANNED'] })
  status!: string;

  @Prop({ default: Date.now })
  createdAt: Date = new Date();

  @Prop({ default: Date.now })
  updatedAt: Date = new Date();
}

export const UserModelSchema = SchemaFactory.createForClass(UserModel);
