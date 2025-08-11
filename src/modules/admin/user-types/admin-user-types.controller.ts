import { Controller, Post, Body, Get, Query, Request, UsePipes, Param } from '@nestjs/common';

import { slugify } from 'src/common/utils/slugify';
import { QueryParamsDto } from 'src/common/dto/query-params-dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import {
  CreateAdminUserTypeDto,
  createAdminUserTypeSchema, StatusChangeAdminUserTypeDto,
  UpdateAdminUserTypeDto, updateAdminUserTypeSchema
} from 'src/common/dto/admin/admin-user-type.dto';

import { AdminUserTypesService } from 'src/modules/admin/user-types/admin-user-types.service';

@Controller()
export class AdminUserTypesController {
  constructor(private readonly adminUserTypesService: AdminUserTypesService) { }


  @Get()
  async findAll(@Query() queryParams: QueryParamsDto, @Request() req: any) {
    const { page_size, limit, sortby, sortorder, keyword } = queryParams
    let query: any = { _id: { $exists: true } };

    const sort: any = {};
    if (sortby && sortorder) {
      sort[sortby] = sortorder === 'desc' ? -1 : 1;
    }

    if (keyword) {
      const keywordRegex = new RegExp(keyword, 'i');
      query = {
        $or: [
          { userTypeName: keywordRegex },
        ],
        ...query
      } as any;
    }
    const userTypes: any = await this.adminUserTypesService.findAll({
      page: parseInt(page_size as string),
      limit: parseInt(limit as string),
      query,
      sort,
    });

    return userTypes;
  }

  @Post()
  @UsePipes(new ZodValidationPipe(createAdminUserTypeSchema))
  create(@Body() createAdminUserTypeDto: CreateAdminUserTypeDto, @Request() req: any) {
    return this.adminUserTypesService.create({
      ...createAdminUserTypeDto,
      slug: slugify(createAdminUserTypeDto.userTypeName),
      createdBy: req.user._id
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.adminUserTypesService.findOne(id);
  }

  @Post(':id')
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(updateAdminUserTypeSchema)) updateAdminUserTypeDto: UpdateAdminUserTypeDto) {
    return this.adminUserTypesService.update(id, updateAdminUserTypeDto);
  }

  @Post('status-change/:id')
  async statusChange(@Param('id') id: string, @Body() statusChangeAdminUserTypeDto: StatusChangeAdminUserTypeDto) {
    const { status } = statusChangeAdminUserTypeDto
    const updateData: any = { status }
    return await this.adminUserTypesService.update(id, updateData);
  }

}
