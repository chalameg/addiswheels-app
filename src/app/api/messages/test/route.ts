import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

// GET - Test endpoint to check message structure
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get a sample message to check the structure
    const sampleMessage = await prisma.message.findFirst({
      where: {
        OR: [
          { senderId: decoded.userId },
          { receiverId: decoded.userId }
        ]
      },
      select: {
        id: true,
        senderId: true,
        receiverId: true,
        vehicleId: true,
        text: true,
        timestamp: true,
        readAt: true
      }
    });

    // Get total message count
    const totalMessages = await prisma.message.count();

    // Get unread messages count
    const unreadMessages = await prisma.message.count({
      where: {
        receiverId: decoded.userId,
        readAt: null
      }
    });

    return NextResponse.json({
      sampleMessage,
      totalMessages,
      unreadMessages,
      userId: decoded.userId
    });
  } catch (error) {
    console.error('Error in test endpoint:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 