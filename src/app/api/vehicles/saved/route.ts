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
  } catch (error) {
    return null;
  }
}

// Get saved vehicles for the authenticated user
export async function GET(req: NextRequest) {
  try {
    const user = await verifyToken(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedVehicles = await prisma.savedVehicle.findMany({
      where: {
        userId: user.userId
      },
      include: {
        vehicle: {
          include: {
            owner: {
              select: {
                name: true,
                email: true,
                phone: true,
                whatsapp: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match the expected format
    const vehicles = savedVehicles.map(sv => sv.vehicle);

    return NextResponse.json({ 
      vehicles,
      count: vehicles.length
    });

  } catch (error) {
    console.error('Error fetching saved vehicles:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 