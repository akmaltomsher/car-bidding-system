import { z as zod } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const USER_STATUS = {
  ACTIVE: '1',
  INACTIVE: '2',
  BLOCKED: '3',
} as const;

export const createUserSchema = zod.object({
  email: zod.string({ required_error: 'Email is required' }).email('Invalid email address'),
  username: zod.string({ required_error: 'User name is required' }).min(2, 'User name must be at least 2 characters'),
  phone: zod
    .string({ required_error: 'Phone number is required' })
    .min(7, 'Phone number must be at least 7 characters')
    .regex(/^\+?[0-9]+$/, 'Phone number must contain only numbers and optional + sign'),
  password: zod.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  userImageUrl: zod
    .string()
    .url('Invalid image URL')
    .optional()
    .or(zod.literal('').transform(() => undefined)),

  status: zod
    .enum([USER_STATUS.ACTIVE, USER_STATUS.INACTIVE, USER_STATUS.BLOCKED], {
      invalid_type_error: 'Invalid status',
    })
    .optional(),
});

export const updateUserSchema = createUserSchema.partial();

export const UserStatusSchema = zod.object({
  status: zod.enum(['1', '2', '3'], {
    errorMap: () => ({
      message: "Status must be one of: '1', '2', or '3'",
    }),
  }),
});

export class CreateUserDto extends createZodDto(createUserSchema) {}
export class UpdateUserDto extends createZodDto(updateUserSchema) {}
export class StatusChangeUserDto extends createZodDto(UserStatusSchema) {}
