import { Module } from '@nestjs/common';
import { RouterModule } from '@nestjs/core';
import { AdminAuctionModule } from 'src/modules/admin/admin-auctions/admin-auction.module';
import { CarModule } from 'src/modules/admin/cars/car.module';
import { AdminUserTypeModule } from 'src/modules/admin/user-types/admin-user-types.module';

import { AuthModule } from 'src/modules/auth/auth.module';
import { BidModule } from 'src/modules/bidding/bid.module';
import { UserModule } from 'src/modules/users/user.module';

@Module({
  imports: [
    RouterModule.register([
      {
        path: 'admin',
        children: [
          {
            path: 'user-types',
            module: AdminUserTypeModule,
          },
          {
            path: 'cars',
            module: CarModule,
          },
          {
            path: 'auctions',
            module: AdminAuctionModule,
          },
        ],
      },
      {
        path: 'login',
        module: AuthModule,
      },
      {
        path: 'users',
        module: UserModule,
      },
      {
        path: 'bidding',
        module: BidModule,
      },
    ]),
  ],
  exports: [RouterModule],
})
export class RoutingModule { }
