import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    where: { userId: user.userId },
    include: { vehicle: true },
    orderBy: { startDate: 'desc' },
  });
  return NextResponse.json({ bookings });
} 