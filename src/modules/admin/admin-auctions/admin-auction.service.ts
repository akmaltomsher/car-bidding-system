import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { get } from 'lodash';
import { Model } from 'mongoose';

import { UpdateAuctionDto } from 'src/common/dto/admin/auction.dto';
import { pagination } from 'src/common/utils/pagination';
import { AdminAuctionModel, AdminAuctionModelDocument } from 'src/modules/admin/admin-auctions/admin-auction.schema';

@Injectable()
export class AdminAuctionService {
  private readonly logger = new Logger(AdminAuctionService.name);

  constructor(
    @InjectModel(AdminAuctionModel.name)
    private readonly adminAuctionModel: Model<AdminAuctionModelDocument>,
  ) { }

  public get model() {
    return this.adminAuctionModel;
  }

  async findAll(options: any): Promise<{ data: AdminAuctionModel[]; totalCount: number }> {
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

    const retVal = await this.adminAuctionModel.aggregate(pipeline).exec();

    return {
      totalCount: get(retVal, '[0].totalCount', 0),
      data: get(retVal, '[0].data', []),
    };
  }

  async create(createAuctionDto: any): Promise<AdminAuctionModel> {
    const newAuction = new this.adminAuctionModel(createAuctionDto);
    return newAuction.save();
  }

  async findOne(id: string): Promise<AdminAuctionModel | null> {
    return this.adminAuctionModel.findById(id).exec();
  }

  async update(id: string, updateAuctionDto: UpdateAuctionDto): Promise<AdminAuctionModel | null> {
    const updatedAuction = await this.adminAuctionModel.findByIdAndUpdate(id, updateAuctionDto, { new: true }).exec();
    if (!updatedAuction) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }
    return updatedAuction;
  }

  async remove(id: string): Promise<void> {
    const result = await this.adminAuctionModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Auction with ID ${id} not found`);
    }
  }
}
