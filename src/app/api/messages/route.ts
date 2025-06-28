import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../auth-middleware';

const prisma = new PrismaClient();

// GET - Fetch messages for a specific vehicle between two users
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');
    const otherUserId = searchParams.get('otherUserId');

    if (!vehicleId || !otherUserId) {
      return NextResponse.json({ error: 'Missing vehicleId or otherUserId' }, { status: 400 });
    }

    // Fetch messages between the two users for this vehicle
    const messages = await prisma.message.findMany({
      where: {
        vehicleId: parseInt(vehicleId),
        OR: [
          {
            senderId: decoded.userId,
            receiverId: parseInt(otherUserId)
          },
          {
            senderId: parseInt(otherUserId),
            receiverId: decoded.userId
          }
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
        }
      },
      orderBy: {
        timestamp: 'asc'
      }
    });

    return NextResponse.json({ messages });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST - Send a new message
export async function POST(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId, vehicleId, text } = await req.json();

    if (!receiverId || !vehicleId || !text) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (text.trim().length === 0) {
      return NextResponse.json({ error: 'Message cannot be empty' }, { status: 400 });
    }

    // Verify the vehicle exists and the receiver is the owner
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicleId) },
      include: { owner: true }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Ensure the sender is not messaging themselves
    if (decoded.userId === parseInt(receiverId)) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    // Verify the receiver is either the vehicle owner or the sender is the vehicle owner
    if (vehicle.ownerId !== parseInt(receiverId) && vehicle.ownerId !== decoded.userId) {
      return NextResponse.json({ error: 'Invalid receiver' }, { status: 400 });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: decoded.userId,
        receiverId: parseInt(receiverId),
        vehicleId: parseInt(vehicleId),
        text: text.trim()
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
        }
      }
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 