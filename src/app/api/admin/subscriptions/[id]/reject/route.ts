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

    // Get subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!subscription) {
      return NextResponse.json({ error: 'Subscription not found' }, { status: 404 });
    }

    if (subscription.status !== 'PENDING') {
      return NextResponse.json({ error: 'Subscription is not pending' }, { status: 400 });
    }

    // Update subscription
    await prisma.subscription.update({
      where: { id: parseInt(id) },
      data: {
        status: 'REJECTED',
        approvedAt: new Date(),
        approvedBy: decoded.userId
      }
    });

    // Send notification to user
    await notifyUser(subscription.userId, `❌ Your ${subscription.planType} subscription has been rejected. Please check your payment details and try again.`);

    return NextResponse.json({ 
      message: 'Subscription rejected successfully'
    });

  } catch (error) {
    console.error('Error rejecting subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 