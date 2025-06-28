import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '';

// Helper function to verify JWT token
async function verifyToken(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    return decoded;
  } catch {
    return null;
  }
}

// Save a vehicle
export async function POST(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { vehicleId } = await req.json();
    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Check if vehicle exists
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: parseInt(vehicleId) }
    });

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 });
    }

    // Check if already saved
    const existingSave = await prisma.savedVehicle.findUnique({
      where: {
        userId_vehicleId: {
          userId: user.userId,
          vehicleId: parseInt(vehicleId)
        }
      }
    });

    if (existingSave) {
      return NextResponse.json({ 
        message: 'Vehicle is already saved to your favorites',
        alreadySaved: true,
        savedVehicle: existingSave 
      }, { status: 200 });
    }

    // Save the vehicle
    const savedVehicle = await prisma.savedVehicle.create({
      data: {
        userId: user.userId,
        vehicleId: parseInt(vehicleId)
      }
    });

    return NextResponse.json({ 
      message: 'Vehicle saved successfully',
      savedVehicle 
    });

  } catch (error) {
    console.error('Error saving vehicle:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// Unsave a vehicle
export async function DELETE(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const vehicleId = searchParams.get('vehicleId');

    if (!vehicleId) {
      return NextResponse.json({ error: 'Vehicle ID is required' }, { status: 400 });
    }

    // Delete the saved vehicle
    const deletedSave = await prisma.savedVehicle.deleteMany({
      where: {
        userId: user.userId,
        vehicleId: parseInt(vehicleId)
      }
    });

    if (deletedSave.count === 0) {
      return NextResponse.json({ error: 'Vehicle not found in saved list' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Vehicle removed from saved list' 
    });

  } catch (error) {
    console.error('Error unsaving vehicle:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 