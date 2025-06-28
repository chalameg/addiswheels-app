import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../auth-middleware';
import { notifyUser } from '@/utils/notifyUser';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verify admin authentication
    const decoded = verifyAuth(req);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleId } = await req.json();

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Get vehicle with owner details
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    if (vehicle.status === 'APPROVED') {
      return NextResponse.json({ error: 'Vehicle is already approved' }, { status: 400 });
    }

    // Update vehicle status
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: 'APPROVED' }
    });

    // Send notification to vehicle owner
    await notifyUser(vehicle.ownerId, `✅ Your vehicle "${vehicle.brand} ${vehicle.model}" has been approved and is now live on AddisWheels!`);

    return NextResponse.json({ 
      message: 'Vehicle approved successfully',
      vehicle: {
        id: vehicle.id,
        brand: vehicle.brand,
        model: vehicle.model,
        status: 'APPROVED'
      }
    });

  } catch (error) {
    console.error('Error approving vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 