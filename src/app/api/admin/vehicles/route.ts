import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';
import logger from '@/utils/logger';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const user = verifyAuth(req);
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get pagination parameters from query string
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit)); // Max 50 items per page
    const skip = (validPage - 1) * validLimit;

    // Build where clause for search and status
    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { brand: { contains: search, mode: 'insensitive' as const } },
        { model: { contains: search, mode: 'insensitive' as const } },
        { owner: { name: { contains: search, mode: 'insensitive' as const } } }
      ];
    }
    
    if (status) {
      whereClause.status = status;
    }

    // Get total count for pagination
    const totalVehicles = await prisma.vehicle.count({ where: whereClause });

    // Get vehicles with pagination
    const vehicles = await prisma.vehicle.findMany({
      where: whereClause,
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            whatsapp: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validLimit,
    });

    const totalPages = Math.ceil(totalVehicles / validLimit);

    return NextResponse.json({ 
      vehicles,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalVehicles,
        limit: validLimit,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/admin/vehicles:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = verifyAuth(req);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Check if user is admin
  if (user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  const { type, model, brand, year, pricePerDay, images, ownerId } = await req.json();
  if (!type || !model || !brand || !year || !pricePerDay || !ownerId) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }
  const vehicle = await prisma.vehicle.create({
    data: {
      type,
      model,
      brand,
      year: Number(year),
      pricePerDay: Number(pricePerDay),
      images: images || [],
      ownerId: Number(ownerId),
    },
  });
  return NextResponse.json({ vehicle });
} 