import { Controller, Post, Body, Get, Param, Request, Patch, Delete, UnauthorizedException } from '@nestjs/common';
import { Model } from 'mongoose';
import { isEmpty } from 'lodash';
import { InjectModel } from '@nestjs/mongoose';

import { UserService } from 'src/modules/users/user.service';
import { CreateUserDto, StatusChangeUserDto, UpdateUserDto, updateUserSchema } from 'src/common/dto/user.dto';
import { ZodValidationPipe } from 'src/common/pipes/zod-validation.pipe';
import { SkipAuth } from 'src/modules/auth/skip-auth.decorator';
import { AdminUserTypesModel, AdminUserTypesModelDocument } from 'src/modules/admin/user-types/admin-user-types.schema';

@Controller()
export class UserController {
  constructor(
    private readonly userService: UserService,
    @InjectModel(AdminUserTypesModel.name)
    private readonly adminUserTypesModel: Model<AdminUserTypesModelDocument>,
  ) { }

  @Get()
  async findAll() {
    return this.userService.findAll();
  }

  @Post()
  @SkipAuth()
  async create(@Body() createUserDto: CreateUserDto) {
    const biddingUserType = await this.adminUserTypesModel.findOne({ slug: 'bidding_users' }).lean();
    if (isEmpty(biddingUserType)) {
      throw new UnauthorizedException({
        message: 'User type is required.',
      });
    }
    return this.userService.create({
      ...createUserDto,
      userTypeId: biddingUserType._id,
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body(new ZodValidationPipe(updateUserSchema)) updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @Patch('status-change/:id')
  async statusChange(@Param('id') id: string, @Body() statusChangeUserDto: StatusChangeUserDto) {
    const { status } = statusChangeUserDto;
    return this.userService.update(id, { status });
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.userService.remove(id);
  }
}
