import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const bookings = await prisma.booking.findMany({
    orderBy: { startDate: 'desc' },
    take: 20,
    include: { vehicle: true },
  });
  return NextResponse.json({ bookings });
} 