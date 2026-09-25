/**
 * Express type extensions
 */
import { User } from '@prisma/client';
import 'express';

declare module 'express' {
  interface Request {
    user?: User;
    userId?: number;
    userTier?: string;
  }
}

export {};
