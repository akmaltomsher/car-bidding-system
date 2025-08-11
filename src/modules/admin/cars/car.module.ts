import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { CarService } from 'src/modules/admin/cars/car.service';
import { CarController } from 'src/modules/admin/cars/car.controller';
import { CarModel, CarModelSchema } from 'src/modules/admin/cars/car.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: CarModel.name, schema: CarModelSchema }])],
  controllers: [CarController],
  providers: [CarService],
  exports: [CarService],
})
export class CarModule {}
