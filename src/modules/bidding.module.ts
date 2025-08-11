import { JwtModule } from '@nestjs/jwt';
import { Module, forwardRef } from '@nestjs/common';

import { AuthModule } from 'src/modules/auth/auth.module';
import { UserModule } from 'src/modules/users/user.module';
import { AdminUserTypeModule } from 'src/modules/admin/user-types/admin-user-types.module';
import { CarModule } from 'src/modules/admin/cars/car.module';
import { AdminAuctionModule } from 'src/modules/admin/admin-auctions/admin-auction.module';
import { BidConsumerModule } from 'src/modules/bidding/bid-consumer.module';
import { BidModule } from './bidding/bid.module';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: '10h' },
    }),
    forwardRef(() => AuthModule),
    UserModule,
    CarModule,
    BidModule,
    BidConsumerModule,
    AdminAuctionModule,
    AdminUserTypeModule,
  ],
  exports: [
    JwtModule,
    AuthModule,
    UserModule,
    CarModule,
    BidModule,
    BidConsumerModule,
    AdminAuctionModule,
    AdminUserTypeModule,
  ],
})
export class BiddingModule { }
