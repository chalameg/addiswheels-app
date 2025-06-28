import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

// POST - Mark messages as read for a specific conversation
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleId, otherUserId } = await req.json();
    console.log('Marking messages as read:', { vehicleId, otherUserId, userId: decoded.userId });

    if (!vehicleId || !otherUserId) {
      return NextResponse.json({ error: 'Missing vehicleId or otherUserId' }, { status: 400 });
    }

    // Try a simpler approach - just update messages without checking first
    const result = await prisma.message.updateMany({
      where: {
        vehicleId: parseInt(vehicleId),
        senderId: parseInt(otherUserId),
        receiverId: decoded.userId,
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    });

    console.log(`Marked ${result.count} messages as read`);

    return NextResponse.json({ success: true, markedCount: result.count });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 