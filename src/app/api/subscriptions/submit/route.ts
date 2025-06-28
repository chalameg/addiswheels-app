import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is verified
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isVerified: true, verificationStatus: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Account verification required to subscribe. Please complete verification first.',
        requiresVerification: true 
      }, { status: 403 });
    }

    const { planType, amount, paymentMethod, referenceNumber, screenshot } = await req.json();

    // Validate required fields
    if (!planType || !amount || !paymentMethod || !referenceNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate plan type
    if (!['MONTHLY', 'QUARTERLY', 'YEARLY'].includes(planType)) {
      return NextResponse.json({ error: 'Invalid subscription plan' }, { status: 400 });
    }

    // Validate amount
    if (amount <= 0) {
      return NextResponse.json({ error: 'Amount must be greater than 0' }, { status: 400 });
    }

    // Create subscription with PENDING status
    const subscription = await prisma.subscription.create({
      data: {
        userId: decoded.userId,
        planType,
        amount,
        paymentMethod,
        referenceNumber,
        screenshot: screenshot || null,
        status: 'PENDING'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json({ 
      message: 'Subscription submitted successfully and pending approval',
      subscription 
    });

  } catch (error) {
    console.error('Error submitting subscription:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 