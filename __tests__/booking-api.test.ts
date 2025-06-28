import { createMocks } from 'node-mocks-http';
import { POST as bookingPost } from '../src/app/api/booking/route';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || '';

function getAuthHeader(user: any) {
  const token = jwt.sign(user, JWT_SECRET);
  return { authorization: `Bearer ${token}` };
}

describe('Booking API', () => {
  let vehicle: any;
  let user: any;

  beforeAll(async () => {
    // Create a test user and vehicle
    user = await prisma.user.create({
      data: {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'hashedpassword',
      },
    });
    vehicle = await prisma.vehicle.create({
      data: {
        type: 'CAR',
        brand: 'TestBrand',
        model: 'TestModel',
        year: 2022,
        pricePerDay: 50,
        available: true,
      },
    });
  });

  afterAll(async () => {
    await prisma.booking.deleteMany({ where: { userId: user.id } });
    await prisma.user.delete({ where: { id: user.id } });
    await prisma.vehicle.delete({ where: { id: vehicle.id } });
    await prisma.$disconnect();
  });

  it('should require authentication', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      body: { vehicleId: vehicle.id, startDate: '2025-01-01', endDate: '2025-01-03' },
    });
    const response = await bookingPost(req);
    expect(response.status).toBe(401);
  });

  it('should create a booking for available dates', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: getAuthHeader({ userId: user.id, email: user.email }),
      body: { vehicleId: vehicle.id, startDate: '2025-01-01', endDate: '2025-01-03' },
    });
    req.headers = getAuthHeader({ userId: user.id, email: user.email });
    req._body = { vehicleId: vehicle.id, startDate: '2025-01-01', endDate: '2025-01-03' };
    const response = await bookingPost(req);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.booking).toBeDefined();
    expect(data.booking.vehicleId).toBe(vehicle.id);
  });

  it('should reject overlapping bookings', async () => {
    const { req, res } = createMocks({
      method: 'POST',
      headers: getAuthHeader({ userId: user.id, email: user.email }),
      body: { vehicleId: vehicle.id, startDate: '2025-01-02', endDate: '2025-01-04' },
    });
    req.headers = getAuthHeader({ userId: user.id, email: user.email });
    req._body = { vehicleId: vehicle.id, startDate: '2025-01-02', endDate: '2025-01-04' };
    const response = await bookingPost(req);
    expect(response.status).toBe(409);
    const data = await response.json();
    expect(data.error).toMatch(/not available/i);
  });
}); 