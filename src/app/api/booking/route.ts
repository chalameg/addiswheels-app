import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../auth-middleware';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization');
    console.log('BOOKING API: Authorization header:', authHeader);
    const user = verifyAuth(req);
    console.log('BOOKING API: User object:', user);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { vehicleId, startDate, endDate } = await req.json();
    console.log('BOOKING API: Request data:', { vehicleId, startDate, endDate });
    
    if (!vehicleId || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    // Convert vehicleId to number
    const vehicleIdNum = parseInt(vehicleId);
    if (isNaN(vehicleIdNum)) {
      return NextResponse.json({ error: 'Invalid vehicle ID' }, { status: 400 });
    }

    // Get vehicle details to calculate total price
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleIdNum },
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = vehicle.pricePerDay * days;

    // Check for overlapping bookings
    const overlapping = await prisma.booking.findFirst({
      where: {
        vehicleId: vehicleIdNum,
        OR: [
          {
            startDate: { lte: new Date(endDate) },
            endDate: { gte: new Date(startDate) },
          },
        ],
      },
    });
    if (overlapping) {
      return NextResponse.json({ error: 'Vehicle is not available for the selected dates.' }, { status: 409 });
    }

    const booking = await prisma.booking.create({
      data: {
        userId: user.userId,
        vehicleId: vehicleIdNum,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        totalPrice: totalPrice,
      },
    });
    console.log('BOOKING API: Booking created successfully:', booking);
    return NextResponse.json({ booking });
  } catch (error) {
    console.error('Booking creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
} 