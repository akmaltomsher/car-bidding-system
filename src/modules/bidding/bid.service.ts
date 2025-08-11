import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class BidProducerService {
  constructor(@Inject('BID_RMQ') private readonly client: ClientProxy) {}

  async placeBid(bidPayload: { auctionId: string; userId: string; amount: number }) {
    return this.client.emit('place-bid', bidPayload);
  }
}
