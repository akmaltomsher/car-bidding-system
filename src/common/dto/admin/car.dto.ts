import { createZodDto } from 'nestjs-zod';
import { z as zod } from 'zod';

export const createCarSchema = zod.object({
  vin: zod.string({ required_error: 'VIN is required' }).min(11, 'VIN must be at least 11 characters').max(17, 'VIN cannot exceed 17 characters'),
  make: zod.string({ required_error: 'Make is required' }).min(2, 'Make must be at least 2 characters'),
  model: zod.string({ required_error: 'Model is required' }).min(1, 'Model is required'),
  year: zod
    .number({ required_error: 'Year is required' })
    .int('Year must be an integer')
    .gte(1886, 'Year must be greater than or equal to 1886')
    .lte(new Date().getFullYear() + 1, 'Year cannot be in the distant future'),

  color: zod.string().optional(),
  mileage: zod.number().int().nonnegative().optional(),
  description: zod.string().optional(),
  imageUrl: zod.string().url('Invalid image URL').optional(),
  status: zod.string().optional(),
});

export const carStatusSchema = zod.object({
  status: zod.enum(['1', '2', '3'], {
    errorMap: () => ({
      message: "Status must be one of: '1', '2', or '3'",
    }),
  }),
});
export const updateCarSchema = createCarSchema.partial();

export class CreateCarDto extends createZodDto(createCarSchema) {}
export class UpdateCarDto extends createZodDto(updateCarSchema) {}
export class StatusChangeCarDto extends createZodDto(carStatusSchema) {}
