import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserService } from 'src/modules/users/user.service';
import { UserController } from 'src/modules/users/user.controller';
import { UserModel, UserModelSchema } from 'src/modules/users/user.schema';
import { SequenceModule } from 'src/modules/common/sequence/sequence-module';
import { AdminUserTypesModel, AdminUserTypesModelSchema } from 'src/modules/admin/user-types/admin-user-types.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserModelSchema },
      { name: AdminUserTypesModel.name, schema: AdminUserTypesModelSchema }
    ]),
    SequenceModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule { }
