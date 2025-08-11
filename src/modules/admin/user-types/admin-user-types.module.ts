import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminUserTypesController } from 'src/modules/admin/user-types/admin-user-types.controller';
import { AdminUserTypesService } from 'src/modules/admin/user-types/admin-user-types.service';
import { AdminUserTypesModel, AdminUserTypesModelSchema } from 'src/modules/admin/user-types/admin-user-types.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdminUserTypesModel.name, schema: AdminUserTypesModelSchema }]),
  ],
  controllers: [AdminUserTypesController],
  providers: [AdminUserTypesService,],
  exports: [AdminUserTypesService],
})
export class AdminUserTypeModule { }