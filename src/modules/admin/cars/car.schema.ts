import { Document } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { collections } from 'src/constants/collections';

export type CarModelDocument = CarModel & Document;

@Schema({ collection: collections.admin.cars, timestamps: true })
export class CarModel {
  @Prop({ required: true, unique: true })
  vin!: string;

  @Prop({ required: true })
  make!: string;

  @Prop({ required: true })
  model!: string;

  @Prop({ required: true })
  year!: number;

  @Prop({ default: '' })
  color?: string;

  @Prop({ default: '' })
  mileage?: number;

  @Prop({ default: '' })
  description?: string;

  @Prop({ default: '' })
  imageUrl?: string;

  @Prop({ default: '1', enum: ['1', '2'] }) // 1- active, 2- inactive
  status!: string;
}

export const CarModelSchema = SchemaFactory.createForClass(CarModel);
