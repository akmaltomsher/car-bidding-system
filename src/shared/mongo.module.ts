import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserModel, UserModelSchema } from 'src/modules/users/user.schema';
// import { CustomerUserModel, CustomerUserModelSchema } from 'src/modules/customer/customer-user/customer-user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserModelSchema },
      // { name: CustomerUserModel.name, schema: CustomerUserModelSchema }
    ]),
  ],
  exports: [
    MongooseModule.forFeature([
      { name: UserModel.name, schema: UserModelSchema },
      // { name: CustomerUserModel.name, schema: CustomerUserModelSchema }
    ]),
  ],
})
export class MongoModule {}
