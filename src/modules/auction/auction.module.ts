import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

import { AuctionService } from 'src/modules/auction/auction.service';
import { AuctionGateway } from 'src/modules/auction/auction.gateway';
import { AdminAuctionModel, AdminAuctionModelSchema } from 'src/modules/admin/admin-auctions/admin-auction.schema';
import { AdminAuctionModule } from 'src/modules/admin/admin-auctions/admin-auction.module';
import { RedisService } from 'src/redis/redis.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BidProducerService } from 'src/modules/bidding/bid.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AdminAuctionModel.name, schema: AdminAuctionModelSchema }]),
    ScheduleModule.forRoot(),
    forwardRef(() => AdminAuctionModule),
    ClientsModule.register([
      {
        name: 'BID_RMQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'bid-queue',
          queueOptions: {
            durable: true,
            arguments: {
              'x-dead-letter-exchange': 'dlx-exchange',
              'x-dead-letter-routing-key': 'dlx-key',
            },
          },
        },
      },
    ]),
  ],
  providers: [AuctionService, AuctionGateway, RedisService, BidProducerService],
  exports: [AuctionService, AuctionGateway, RedisService, BidProducerService],
})
export class AuctionModule { }
