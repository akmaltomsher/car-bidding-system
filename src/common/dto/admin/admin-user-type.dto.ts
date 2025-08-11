import { z as zod } from 'zod';
import { createZodDto } from 'nestjs-zod';

export const createAdminUserTypeSchema = zod.object({
    userTypeName: zod.string({ required_error: 'User type name is required' }).min(2, { message: 'User type name is should be 2 chars minimum' }),
    status: zod.string().optional(),
});

export const updateAdminUserTypeSchema = createAdminUserTypeSchema.partial();

export const AdminUserTypeStatusSchema = zod.object({
    status: zod.string().min(1, { message: "Status is required" }).max(1, { message: "Status must be a single character" }).refine(value => value === "1" || value === "3", { message: "Status must be either '1' or '2'" })
});

export class CreateAdminUserTypeDto extends createZodDto(createAdminUserTypeSchema) { };
export class UpdateAdminUserTypeDto extends createZodDto(updateAdminUserTypeSchema) { };
export class StatusChangeAdminUserTypeDto extends createZodDto(AdminUserTypeStatusSchema) { };