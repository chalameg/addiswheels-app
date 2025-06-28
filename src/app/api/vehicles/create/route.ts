import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { verifyAuth } from '../../auth-middleware';
import { config } from '@/utils/config';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    // Verify user authentication
    const decoded = verifyAuth(req);
    if (!decoded) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is verified and get monetization fields
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { isVerified: true, verificationStatus: true, extraListings: true, isSubscriber: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.isVerified) {
      return NextResponse.json({ 
        error: 'Account verification required to list vehicles. Please complete verification first.',
        requiresVerification: true 
      }, { status: 403 });
    }

    // Monetization: enforce listing limit if enabled
    if (config.listingLimit.enabled && !user.isSubscriber) {
      const vehicleCount = await prisma.vehicle.count({ where: { ownerId: decoded.userId } });
      const allowed = config.listingLimit.freeListings + (user.extraListings || 0);
      if (vehicleCount >= allowed) {
        return NextResponse.json({
          error: `You have reached your free vehicle listing limit (${allowed}). Please subscribe for unlimited listings or pay for additional listings.`,
          requiresPayment: true,
          allowsSubscription: true,
          allowed,
          current: vehicleCount
        }, { status: 403 });
      }
    }

    const { type, brand, model, year, pricePerDay, images } = await req.json();

    // Validate required fields
    if (!type || !brand || !model || !year || !pricePerDay) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Validate vehicle type
    if (!['CAR', 'MOTORBIKE'].includes(type)) {
      return NextResponse.json({ error: 'Invalid vehicle type' }, { status: 400 });
    }

    // Validate year
    if (year < 1900 || year > new Date().getFullYear() + 1) {
      return NextResponse.json({ error: 'Invalid year' }, { status: 400 });
    }

    // Validate price
    if (pricePerDay <= 0) {
      return NextResponse.json({ error: 'Price must be greater than 0' }, { status: 400 });
    }

    // Validate images (required, must be array of 2-4 strings)
    let imagesToSave: string[] = [];
    if (images) {
      if (!Array.isArray(images) || images.length < 2 || images.length > 4 || images.some((img) => typeof img !== 'string')) {
        return NextResponse.json({ error: 'Images must be an array of 2-4 URLs' }, { status: 400 });
      }
      imagesToSave = images;
    } else {
      return NextResponse.json({ error: 'At least 2 images are required' }, { status: 400 });
    }

    // Create vehicle with PENDING status
    const vehicle = await prisma.vehicle.create({
      data: {
        type,
        brand,
        model,
        year,
        pricePerDay,
        images: imagesToSave,
        ownerId: decoded.userId,
        status: 'PENDING'
      },
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
      }
    });

    return NextResponse.json({ 
      message: 'Vehicle created successfully and pending approval',
      vehicle 
    });

  } catch (error) {
    console.error('Error creating vehicle:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 