import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../../auth-middleware';
import { config } from '@/utils/config';
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

    // Calculate subscription dates
    const now = new Date();
    const planData = config.subscriptionPlans.find(plan => plan.id === subscription.planType);
    const endDate = new Date(now.getTime() + (planData?.duration || 30) * 24 * 60 * 60 * 1000);

    // Update subscription and user
    await prisma.$transaction([
      // Update subscription
      prisma.subscription.update({
        where: { id: parseInt(id) },
        data: {
          status: 'APPROVED',
          approvedAt: now,
          approvedBy: decoded.userId,
          startDate: now,
          endDate: endDate
        }
      }),
      // Update user subscription status
      prisma.user.update({
        where: { id: subscription.userId },
        data: {
          isSubscriber: true,
          subscriptionExpiresAt: endDate
        }
      })
    ]);

    // Send notification to user
    await notifyUser(subscription.userId, `👑 Your ${subscription.planType} subscription has been approved! You now have unlimited vehicle listings until ${endDate.toLocaleDateString()}.`);

    return NextResponse.json({ 
      message: 'Subscription approved successfully',
      subscription: {
        id: subscription.id,
        planType: subscription.planType,
        startDate: now,
        endDate: endDate
      }
    });

  } catch (error) {
    console.error('Error approving subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 