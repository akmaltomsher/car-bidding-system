import { createZodDto } from 'nestjs-zod';
import { z as zod } from 'zod';

export const bidSchema = zod.object({
  auctionId: zod.string().min(1, 'Auction ID is required'),
  amount: zod.number().positive('Bid amount must be greater than 0'),
});

export class PlaceBidDto extends createZodDto(bidSchema) { }
