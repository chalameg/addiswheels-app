import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../auth-middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const notifications = await prisma.notification.findMany({
      where: { userId: decoded.userId },
      orderBy: [
        { read: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return NextResponse.json({ notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 