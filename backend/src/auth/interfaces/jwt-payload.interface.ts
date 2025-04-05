import { UserRole } from '../../users/entities/user.entity';

export interface JwtPayload {
  email: string;
  sub: number;
  role: UserRole;
  tokenVersion: number;
} 