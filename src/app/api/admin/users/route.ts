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

    // Validate pagination parameters
    const validPage = Math.max(1, page);
    const validLimit = Math.min(50, Math.max(1, limit)); // Max 50 items per page
    const skip = (validPage - 1) * validLimit;

    // Build where clause for search
    const whereClause = search ? {
      OR: [
        { name: { contains: search, mode: 'insensitive' as const } },
        { email: { contains: search, mode: 'insensitive' as const } },
        { phone: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {};

    // Get total count for pagination
    const totalUsers = await prisma.user.count({ where: whereClause });

    // Get users with pagination
    const users = await prisma.user.findMany({
      where: whereClause,
      select: { 
        id: true, 
        name: true, 
        email: true, 
        role: true, 
        blocked: true,
        createdAt: true,
        phone: true,
        whatsapp: true
      },
      orderBy: { id: 'asc' },
      skip,
      take: validLimit,
    });

    const totalPages = Math.ceil(totalUsers / validLimit);

    return NextResponse.json({ 
      users,
      pagination: {
        currentPage: validPage,
        totalPages,
        totalUsers,
        limit: validLimit,
        hasNextPage: validPage < totalPages,
        hasPrevPage: validPage > 1
      }
    });
  } catch (error) {
    logger.error('Error in GET /api/admin/users:', { error });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 