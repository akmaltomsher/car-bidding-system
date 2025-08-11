import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { RedisService } from 'src/redis/redis.service';
import { AuctionGateway } from 'src/modules/auction/auction.gateway';
import { BidModel } from 'src/modules/bidding/bid.schema';
import { AdminAuctionModel } from 'src/modules/admin/admin-auctions/admin-auction.schema';
import { SequenceService } from 'src/modules/common/sequence/sequence-service';

@Injectable()
export class BidConsumerService {
  private readonly logger = new Logger(BidConsumerService.name);
  private readonly cacheKey = 'auction-list';

  constructor(
    @InjectModel(BidModel.name) private readonly bidModel: Model<BidModel>,
    @InjectModel(AdminAuctionModel.name) private readonly adminAuctionModel: Model<AdminAuctionModel>,
    private readonly redisService: RedisService,
    private readonly auctionGateway: AuctionGateway,
    private readonly sequenceService: SequenceService,
  ) { }

  async processBid(bidData: any): Promise<void> {
    this.logger.debug(`Processing bid: ${JSON.stringify(bidData)}`);

    if (!bidData?.auctionId || !bidData?.userId || typeof bidData?.amount !== 'number') {
      throw new Error('Invalid bid payload');
    }
    const auctionId = new Types.ObjectId(bidData.auctionId);
    const userId = new Types.ObjectId(bidData.userId);

    const auction: any = await this.adminAuctionModel.findOne({
      _id: auctionId,
      status: 'ACTIVE',
      endTime: { $gte: new Date() },
    });

    if (!auction) {
      throw new Error('Auction not found, inactive, or already ended.');
    }

    if (auction.currentHighestBid > 0 && bidData.amount <= auction.currentHighestBid) {
      throw new Error('Bid rejected: lower than or equal to current highest bid.');
    }

    const bidCode = await this.sequenceService.getNextSequenceCode('bidSequence');

    auction.currentHighestBid = bidData.amount;
    auction.winnerId = userId;
    auction.updatedAt = new Date();
    auction.bidCode = bidCode;
    await auction.save();
    await this.bidModel.create({
      auctionId,
      userId,
      bidAmount: bidData.amount,
      bidCode,
    });

    await this.redisService.del(this.cacheKey);

    this.auctionGateway.server.to(bidData.auctionId).emit('new-highest-bid', {
      auctionId: bidData.auctionId,
      highestBid: bidData.amount,
      bidder: bidData.userId,
    });

    this.logger.log(
      `Bid processed for auction=${bidData.auctionId}, new highest=${bidData.amount} (BidCode: ${bidCode})`
    );
  }

}
