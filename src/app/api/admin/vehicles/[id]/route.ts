import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../../auth-middleware';
import { notifyUser } from '@/utils/notifyUser';

const prisma = new PrismaClient();

export async function PUT(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const vehicleId = Number(id);
    const body = await req.json();
    
    // Handle status updates (for approve/reject)
    if (body.status) {
      const { status } = body;
      
      if (!['APPROVED', 'REJECTED'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
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

      if (vehicle.status === status) {
        return NextResponse.json({ error: `Vehicle is already ${status.toLowerCase()}` }, { status: 400 });
      }

      // Update vehicle status
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { status }
      });

      // Send notification to vehicle owner
      if (status === 'APPROVED') {
        await notifyUser(vehicle.ownerId, `✅ Your vehicle "${vehicle.brand} ${vehicle.model}" has been approved and is now live on AddisWheels!`);
      } else if (status === 'REJECTED') {
        await notifyUser(vehicle.ownerId, `❌ Your vehicle "${vehicle.brand} ${vehicle.model}" has been rejected. Please check your listing details and try again.`);
      }

      return NextResponse.json({ 
        message: `Vehicle ${status.toLowerCase()} successfully`,
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          status
        }
      });
    }
    
    // Handle featured updates
    if (body.featured !== undefined) {
      const { featured } = body;
      
      // Get vehicle to check if it's approved
      const vehicle = await prisma.vehicle.findUnique({
        where: { id: vehicleId }
      });

      if (!vehicle) {
        return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
      }

      if (vehicle.status !== 'APPROVED') {
        return NextResponse.json({ error: 'Only approved vehicles can be featured' }, { status: 400 });
      }

      // Update vehicle featured status
      await prisma.vehicle.update({
        where: { id: vehicleId },
        data: { featured: Boolean(featured) }
      });

      return NextResponse.json({ 
        message: `Vehicle ${featured ? 'marked as featured' : 'removed from featured'} successfully`,
        vehicle: {
          id: vehicle.id,
          brand: vehicle.brand,
          model: vehicle.model,
          featured: Boolean(featured)
        }
      });
    }
    
    // Handle regular vehicle updates (existing functionality)
    const { type, brand, model, year, pricePerDay, images, ownerId } = body;
    if (!type || !brand || !model || !year || !pricePerDay || !ownerId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    
    const vehicle = await prisma.vehicle.update({
      where: { id: vehicleId },
      data: {
        type,
        brand,
        model,
        year: Number(year),
        pricePerDay: Number(pricePerDay),
        images: images || [],
        ownerId: Number(ownerId),
      },
    });
    
    return NextResponse.json({ vehicle });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest, 
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const user = verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    const vehicleId = Number(id);
    
    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({ where: { id: vehicleId } });
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }
    
    // Delete the vehicle
    await prisma.vehicle.delete({ where: { id: vehicleId } });
    return NextResponse.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 