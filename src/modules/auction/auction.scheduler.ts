import { Injectable } from '@nestjs/common';
import { AuctionGateway } from './auction.gateway';
import { AuctionService } from './auction.service';

@Injectable()
export class AuctionScheduler {
  constructor(
    private auctionGateway: AuctionGateway,
    private auctionService: AuctionService
  ) {}

  startAuctionAtTime(auctionId: string, startTime: Date) {
    this.auctionService.scheduleAuctionStart(auctionId, startTime, () => {
      this.auctionService.createAuction(auctionId);
      this.auctionGateway.startAuction(auctionId);
    });
  }
}
