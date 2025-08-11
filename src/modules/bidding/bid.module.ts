import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BidsController } from 'src/modules/bidding/bids.controller';
import { BidProducerService } from 'src/modules/bidding/bid.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'BID_RMQ',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://localhost:5672'],
          queue: 'bid-queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [BidsController],
  providers: [BidProducerService],
  exports: [BidProducerService],
})
export class BidModule { }
