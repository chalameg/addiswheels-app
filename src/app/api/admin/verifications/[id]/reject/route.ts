import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../../auth-middleware';
import { notifyUser } from '@/utils/notifyUser';

const prisma = new PrismaClient();

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin authentication
    const decoded = verifyAuth(req);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(id) }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.verificationStatus === 'REJECTED') {
      return NextResponse.json({ error: 'User verification is already rejected' }, { status: 400 });
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isVerified: false,
        verificationStatus: 'REJECTED'
      }
    });

    // Send notification to user
    await notifyUser(parseInt(id), '❌ Your ID verification has been rejected. Please check your documents and try again.');

    return NextResponse.json({ 
      message: 'User verification rejected successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: false,
        verificationStatus: 'REJECTED'
      }
    });

  } catch (error) {
    console.error('Error rejecting verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 