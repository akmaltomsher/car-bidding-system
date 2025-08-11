import { Controller, Logger } from '@nestjs/common';
import { Ctx, MessagePattern, Payload, RmqContext } from '@nestjs/microservices';
import { BidConsumerService } from './bid-consumer.service';

@Controller()
export class BidConsumerController {
  private readonly logger = new Logger(BidConsumerController.name);

  constructor(private readonly bidConsumerService: BidConsumerService) { }

  @MessagePattern('place-bid')
  async handleBid(@Payload() bidData: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.bidConsumerService.processBid(bidData);
      channel.ack(originalMsg);
    } catch (error: any) {
      this.logger.error(`Failed to process bid: ${error.message}`);
      channel.nack(originalMsg, false, false);
    }
  }
}
