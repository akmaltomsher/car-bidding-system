import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { get } from 'lodash';
import { Model, ObjectId } from 'mongoose';
import { CreateAdminUserTypeDto, UpdateAdminUserTypeDto } from 'src/common/dto/admin/admin-user-type.dto';
import { pagination } from 'src/common/utils/pagination';
import { AdminUserTypesModel, AdminUserTypesModelDocument } from 'src/modules/admin/user-types/admin-user-types.schema';

@Injectable()
export class AdminUserTypesService {
  private readonly logger = new Logger(AdminUserTypesService.name);

  constructor(
    @InjectModel(AdminUserTypesModel.name)
    private readonly adminUserTypesModel: Model<AdminUserTypesModelDocument>,
  ) { }

  public get model() {
    return this.adminUserTypesModel;
  }
  async findAll(options: any): Promise<{ data: AdminUserTypesModel[]; totalCount: number }> {
    const { query, skip, limit, sort } = pagination(options.query || {}, options);

    const defaultSort = { createdAt: -1 };
    let finalSort = sort || defaultSort;
    const sortKeys = Object.keys(finalSort);
    if (sortKeys.length === 0) {
      finalSort = defaultSort;
    }

    let pipeline: any[] = [
      { $match: query },
      {
        $facet: {
          data: [
            { $sort: finalSort },
            { $skip: skip },
            { $limit: limit },
          ],
          totalCount: [{ $count: "count" }]
        }
      },
      {
        $project: {
          data: 1,
          totalCount: { $arrayElemAt: ["$totalCount.count", 0] }
        }
      }
    ];

    const retVal = await this.adminUserTypesModel.aggregate(pipeline).exec();

    return {
      totalCount: get(retVal, '[0].totalCount', 0),
      data: get(retVal, '[0].data', [])
    }
  }

  async create(createAdminUserDto: CreateAdminUserTypeDto | { slug: string; createdBy: ObjectId }): Promise<AdminUserTypesModel> {
    const newUser = new this.adminUserTypesModel(createAdminUserDto);
    return newUser.save();
  }

  async findOne(id: string): Promise<AdminUserTypesModel | null> {
    return this.adminUserTypesModel.findById(id).exec();
  }


  async update(id: string, updateSubscriptionDto: UpdateAdminUserTypeDto): Promise<AdminUserTypesModel | null> {
    return this.adminUserTypesModel.findByIdAndUpdate(id, updateSubscriptionDto, { new: true }).exec();
  }

  async remove(id: string): Promise<void> {
    await this.adminUserTypesModel.findByIdAndDelete(id).exec();
  }
}
