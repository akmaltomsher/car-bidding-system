// src/modules/auth/interfaces/auth-payload.interface.ts
export interface JwtPayload {
  email: string;
  sub: string; // User ID
}
