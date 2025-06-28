import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const status = searchParams.get('status');
  const featured = searchParams.get('featured');

  const where: any = { 
    available: true
  };
  
  // Status filter
  if (status) {
    where.status = status;
  } else {
    where.status = 'APPROVED'; // Default to approved vehicles
  }
  
  if (type && (type === 'CAR' || type === 'MOTORBIKE')) {
    where.type = type;
  }
  if (minPrice) {
    where.pricePerDay = { ...where.pricePerDay, gte: parseFloat(minPrice) };
  }
  if (maxPrice) {
    where.pricePerDay = { ...where.pricePerDay, lte: parseFloat(maxPrice), ...where.pricePerDay };
  }
  
  // Featured filter
  if (featured === 'true') {
    where.featured = true;
  }

  const count = await prisma.vehicle.count({ where });
  return NextResponse.json({ count });
} 