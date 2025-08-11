import { Request } from 'express';
import { get } from 'lodash';
import { Controller, Post, Body, BadRequestException, Req } from '@nestjs/common';

import { BidProducerService } from 'src/modules/bidding/bid.service';
import { PlaceBidDto } from 'src/common/dto/bids.schema';


@Controller()
export class BidsController {
  constructor(private readonly bidProducerService: BidProducerService) { }

  @Post('place-bid')
  async placeBid(@Body() bid: PlaceBidDto, @Req() req: Request) {
    const userId = get(req, 'user._id');
    try {
      if (!userId) {
        throw new BadRequestException('Invalid bid payload');
      }
      await this.bidProducerService.placeBid({ ...bid, userId });
      return { status: 'queued', bid };
    } catch (error: any) {
      if (error.message.includes('lower than or equal to current highest bid')) {
        throw new BadRequestException('Your bid must be higher than the current highest bid.');
      }
      throw error;
    }
  }
}
