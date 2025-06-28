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

    const paymentId = parseInt(id, 10);
    if (!paymentId) {
      return NextResponse.json({ error: 'Invalid payment ID' }, { status: 400 });
    }

    // Get payment details
    const payment = await prisma.payment.findUnique({
      where: { id: paymentId },
      include: { user: true }
    });

    if (!payment) {
      return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
    }

    if (payment.status !== 'PENDING') {
      return NextResponse.json({ error: 'Payment already processed' }, { status: 400 });
    }

    // Update payment status
    await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'REJECTED',
        approvedAt: new Date(),
        approvedBy: decoded.userId
      }
    });

    // Send notification to user
    await notifyUser(payment.userId, `❌ Your payment of ${payment.amount} ETB has been rejected. Please contact support for more information.`);

    return NextResponse.json({ 
      message: 'Payment rejected successfully.'
    });
  } catch (error) {
    console.error('Admin reject payment error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 