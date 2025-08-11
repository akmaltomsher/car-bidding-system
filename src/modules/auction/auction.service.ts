import { Injectable, Logger } from '@nestjs/common';
import { CronJob } from 'cron';
import { SchedulerRegistry } from '@nestjs/schedule';
import { AuctionGateway } from './auction.gateway';

@Injectable()
export class AuctionService {
  private readonly logger = new Logger(AuctionService.name);

  constructor(
    private schedulerRegistry: SchedulerRegistry,
    private auctionGateway: AuctionGateway,
  ) {}

  scheduleAuctionStart(auctionId: string, startTime: Date) {
    const now = new Date();
    if (startTime <= now) {
      this.logger.warn(`Start time is in the past. Starting auction ${auctionId} now.`);
      this.auctionGateway.broadcastAuctionInfo(auctionId, now);
      return;
    }

    const job = new CronJob(startTime, () => {
      this.logger.log(`Auction ${auctionId} started at ${startTime}`);
      this.auctionGateway.broadcastAuctionInfo(auctionId, startTime);
      this.schedulerRegistry.deleteCronJob(`auction-${auctionId}`);
    });

    this.schedulerRegistry.addCronJob(`auction-${auctionId}`, job);
    job.start();
    this.logger.log(`Auction ${auctionId} scheduled to start at ${startTime}`);
  }
}
