import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

// GET - Fetch all conversations for the current user
export async function GET(req: NextRequest) {
  try {
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all messages where the user is either sender or receiver
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
      }
    });

    // Group messages by conversation (vehicle + other user)
    const conversationMap = new Map();

    messages.forEach(message => {
      const vehicleId = message.vehicleId;
      const otherUserId = message.senderId === decoded.userId 
        ? message.receiverId 
        : message.senderId;
      const otherUserName = message.senderId === decoded.userId 
        ? message.receiver.name 
        : message.sender.name;
      
      const conversationKey = `${vehicleId}-${otherUserId}`;
      
      if (!conversationMap.has(conversationKey)) {
        conversationMap.set(conversationKey, {
          vehicleId,
          vehicleName: `${message.vehicle.brand} ${message.vehicle.model}`,
          otherUserId,
          otherUserName,
          lastMessage: message.text,
          lastMessageTime: message.timestamp,
          unreadCount: 0,
          messages: []
        });
      }
      
      const conversation = conversationMap.get(conversationKey);
      conversation.messages.push(message);
      
      // Update last message if this one is more recent
      if (new Date(message.timestamp) > new Date(conversation.lastMessageTime)) {
        conversation.lastMessage = message.text;
        conversation.lastMessageTime = message.timestamp;
      }
      
      // Count unread messages (messages sent to current user that haven't been read)
      if (message.receiverId === decoded.userId && !message.readAt) {
        conversation.unreadCount++;
      }
    });

    // Convert map to array and sort by last message time
    const conversations = Array.from(conversationMap.values())
      .sort((a, b) => new Date(b.lastMessageTime).getTime() - new Date(a.lastMessageTime).getTime());

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 