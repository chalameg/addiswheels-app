import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const minPrice = searchParams.get('minPrice');
  const maxPrice = searchParams.get('maxPrice');
  const cursor = searchParams.get('cursor');
  const limit = parseInt(searchParams.get('limit') || '9', 10);
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
  
  // Type filter
  if (type && (type === 'CAR' || type === 'MOTORBIKE')) {
    where.type = type;
  }
  
  // Price filters
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

  const vehicles = await prisma.vehicle.findMany({
    where,
    orderBy: { id: 'asc' },
    take: limit + 1,
    ...(cursor ? { cursor: { id: Number(cursor) }, skip: 1 } : {}),
  });

  let nextCursor: number | null = null;
  if (vehicles.length > limit) {
    nextCursor = vehicles[limit].id;
    vehicles.pop();
  }

  return NextResponse.json({ vehicles, nextCursor });
} 