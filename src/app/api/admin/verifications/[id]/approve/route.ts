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

    if (user.verificationStatus === 'APPROVED') {
      return NextResponse.json({ error: 'User is already verified' }, { status: 400 });
    }

    // Update user verification status
    await prisma.user.update({
      where: { id: parseInt(id) },
      data: {
        isVerified: true,
        verificationStatus: 'APPROVED'
      }
    });

    // Send notification to user
    await notifyUser(parseInt(id), '🎉 Your ID verification has been approved! You can now list vehicles on AddisWheels.');

    return NextResponse.json({ 
      message: 'User verification approved successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isVerified: true,
        verificationStatus: 'APPROVED'
      }
    });

  } catch (error) {
    console.error('Error approving verification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 