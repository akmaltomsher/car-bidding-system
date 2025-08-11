import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { MongooseModule } from '@nestjs/mongoose';

import { AdminAuctionModel, AdminAuctionModelSchema } from 'src/modules/admin/admin-auctions/admin-auction.schema';
import { RedisService } from 'src/redis/redis.service';
import { AdminAuctionService } from 'src/modules/admin/admin-auctions/admin-auction.service';
import { BidConsumerController } from 'src/modules/bidding/bid-consumer.controller';
import { BidConsumerService } from 'src/modules/bidding/bid-consumer.service';
import { BidModel, BidModelSchema } from 'src/modules/bidding/bid.schema';

import { AuctionModule } from 'src/modules/auction/auction.module';
import { SequenceModule } from 'src/modules/common/sequence/sequence-module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: BidModel.name, schema: BidModelSchema },
      { name: AdminAuctionModel.name, schema: AdminAuctionModelSchema },
    ]),
    AuctionModule,
    SequenceModule,
  ],
  controllers: [BidConsumerController],
  providers: [BidConsumerService, RedisService, AdminAuctionService],
  exports: [BidConsumerService],
})
export class BidConsumerModule { }
