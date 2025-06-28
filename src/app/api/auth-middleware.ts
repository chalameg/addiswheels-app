import { NextRequest } from 'next/server';
import jwt, { JwtPayload } from 'jsonwebtoken';
import logger from '@/utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || '';

export function verifyAuth(req: NextRequest): (JwtPayload & { userId: number; role: string }) | null {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    logger.warn('No valid Authorization header found');
    return null;
  }
  const token = authHeader.replace('Bearer ', '');
  logger.info('JWT_SECRET loaded:', { secret: JWT_SECRET ? '***' : 'undefined' });
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & { userId: number; role: string };
    logger.info('Token verified successfully', { userId: decoded.userId, role: decoded.role });
    return decoded;
  } catch (error) {
    logger.error('Token verification failed:', { error });
    return null;
  }
} 