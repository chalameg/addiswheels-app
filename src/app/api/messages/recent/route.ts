import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

// GET - Fetch recent messages for the current user
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get recent messages where the user is either sender or receiver
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: decoded.userId },
          { receiverId: decoded.userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true
          }
        },
        receiver: {
          select: {
            id: true,
            name: true
          }
        },
        vehicle: {
          select: {
            id: true,
            brand: true,
            model: true
          }
        }
      },
      orderBy: {
        timestamp: 'desc'
      },
      take: 10 // Limit to 10 most recent messages
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 