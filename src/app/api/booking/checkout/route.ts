import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { vehicleId, startDate, endDate } = await req.json();
  if (!vehicleId || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
  if (!vehicle) {
    return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
  }
  // Calculate total price
  const days = (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
  const totalPrice = Math.round(vehicle.pricePerDay * days * 100); // in cents
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${vehicle.brand} ${vehicle.model} (${vehicle.type})`,
              images: vehicle.images && vehicle.images.length > 0 ? [vehicle.images[0]] : undefined,
            },
            unit_amount: Math.round(vehicle.pricePerDay * 100),
          },
          quantity: days,
        },
      ],
      mode: 'payment',
      success_url: process.env.NEXT_PUBLIC_BASE_URL + '/dashboard?success=1',
      cancel_url: process.env.NEXT_PUBLIC_BASE_URL + '/vehicles/' + vehicleId,
      metadata: {
        userId: user.userId,
        vehicleId: vehicle.id,
        startDate,
        endDate,
      },
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: 'Stripe session failed' }, { status: 500 });
  }
} 