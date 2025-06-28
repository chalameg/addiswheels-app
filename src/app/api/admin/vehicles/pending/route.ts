import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../auth-middleware';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verify admin authentication
    const decoded = verifyAuth(req);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get('cursor');
    const limit = parseInt(searchParams.get('limit') || '10', 10);

    const vehicles = await prisma.vehicle.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true
          }
        }
      }
    });

    let nextCursor: number | null = null;
    if (vehicles.length > limit) {
      nextCursor = vehicles[limit].id;
      vehicles.pop();
    }

    return NextResponse.json({ vehicles, nextCursor });

  } catch (error) {
    console.error('Error fetching pending vehicles:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 