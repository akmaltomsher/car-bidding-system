import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminAuctionService } from './admin-auction.service';
import { AdminAuctionController } from './admin-auction.controller';
import { AdminAuctionModel, AdminAuctionModelSchema } from './admin-auction.schema';

import { AuctionModule } from 'src/modules/auction/auction.module';
import { RedisService } from 'src/redis/redis.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdminAuctionModel.name, schema: AdminAuctionModelSchema }]),
    forwardRef(() => AuctionModule),
  ],
  controllers: [AdminAuctionController],
  providers: [AdminAuctionService, RedisService],
  exports: [AdminAuctionService, RedisService],
})
export class AdminAuctionModule { }
