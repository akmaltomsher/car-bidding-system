import { createZodDto } from 'nestjs-zod';
import { auctionStatusEnum } from 'src/constants/admin/auction';
import { z as zod } from 'zod';

export const createAuctionSchema = zod.object({
  carId: zod.string({ required_error: 'Car is required' }).min(2, 'Car must be at least 2 characters'),
  startTime: zod.string({ required_error: 'Start time is required' }).refine((val) => !isNaN(Date.parse(val)), {
    message: 'Start time must be a valid date string',
  }),
  endTime: zod.string({ required_error: 'End time is required' }).refine((val) => !isNaN(Date.parse(val)), {
    message: 'End time must be a valid date string',
  }),
  startingBid: zod
    .number({ required_error: 'Starting bid is required' })
    .nonnegative('Starting bid must be non-negative'),
  currentHighestBid: zod.number().nonnegative().optional(),
  winnerId: zod.string().optional(),
  status: zod.enum(auctionStatusEnum).optional(),
});

export const auctionStatusSchema = zod.object({
  status: zod.enum(auctionStatusEnum, {
    errorMap: () => ({
      message: "Status must be one of: 'ACTIVE' or 'ENDED'",
    }),
  }),
});

export const updateAuctionSchema = createAuctionSchema.partial();

export class CreateAuctionDto extends createZodDto(createAuctionSchema) { }
export class UpdateAuctionDto extends createZodDto(updateAuctionSchema) { }
export class StatusChangeAuctionDto extends createZodDto(auctionStatusSchema) { }
