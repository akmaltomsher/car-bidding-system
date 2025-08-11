// src/modules/admin/auth/skip-auth.decorator.ts
import { SetMetadata } from '@nestjs/common';

export const SKIP_AUTH_KEY = 'skip_auth';
export const SkipAuth = () => SetMetadata(SKIP_AUTH_KEY, true);
