import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { get } from 'lodash';
import { Model } from 'mongoose';

import { UpdateCarDto } from 'src/common/dto/admin/car.dto';
import { pagination } from 'src/common/utils/pagination';
import { CarModel, CarModelDocument } from 'src/modules/admin/cars/car.schema';

@Injectable()
export class CarService {
  private readonly logger = new Logger(CarService.name);

  constructor(
    @InjectModel(CarModel.name)
    private readonly carModel: Model<CarModelDocument>,
  ) { }

  public get model() {
    return this.carModel;
  }

  async findAll(options: any): Promise<{ data: CarModel[]; totalCount: number }> {
    const { query, skip, limit, sort } = pagination(options.query || {}, options);

    const defaultSort = { createdAt: -1 };
    let finalSort = sort || defaultSort;
    const sortKeys = Object.keys(finalSort);
    if (sortKeys.length === 0) {
      finalSort = defaultSort;
    }

    const pipeline: any[] = [
      { $match: query },
      {
        $facet: {
          data: [{ $sort: finalSort }, { $skip: skip }, { $limit: limit },],
          totalCount: [{ $count: 'count' }]
        },
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ['$totalCount.count', 0] }
        },
      },
    ];

    const retVal = await this.carModel.aggregate(pipeline).exec();

    return {
      totalCount: get(retVal, '[0].totalCount', 0),
      data: get(retVal, '[0].data', []),
    };
  }

  async create(createCarDto: any): Promise<CarModel> {
    const newCar = new this.carModel(createCarDto);
    return newCar.save();
  }

  async findOne(id: string): Promise<CarModel | null> {
    return this.carModel.findById(id).exec();
  }

  async update(id: string, updateCarDto: UpdateCarDto): Promise<CarModel | null> {
    const updatedCar = await this.carModel.findByIdAndUpdate(id, updateCarDto, { new: true }).exec();
    if (!updatedCar) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
    return updatedCar;
  }

  async remove(id: string): Promise<void> {
    const result = await this.carModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Car with ID ${id} not found`);
    }
  }
}
