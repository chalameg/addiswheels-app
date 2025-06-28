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

    // Get payment
    const payment = await prisma.payment.findUnique({
      where: { id: parseInt(id) },
      include: { user: true }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Payment is not pending' }, { status: 400 });
    }

    // Update payment and user
    await prisma.$transaction([
      // Update payment
      prisma.payment.update({
        where: { id: parseInt(id) },
        data: {
          status: 'APPROVED',
          approvedAt: new Date(),
          approvedBy: decoded.userId
        }
      }),
      // Update user extra listings
      prisma.user.update({
        where: { id: payment.userId },
        data: {
          extraListings: {
            increment: 1
          }
        }
      })
    ]);

    // Send notification to user
    await notifyUser(payment.userId, `💰 Your payment of ${payment.amount} ETB has been approved! You can now add ${payment.paymentType === 'LISTING' ? '1 more vehicle listing' : 'unlimited listings'}.`);

    return NextResponse.json({ 
      message: 'Payment approved successfully',
      payment: {
        id: payment.id,
        amount: payment.amount,
        status: 'APPROVED',
        approvedAt: new Date()
      }
    });

  } catch (error) {
    console.error('Error approving payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 