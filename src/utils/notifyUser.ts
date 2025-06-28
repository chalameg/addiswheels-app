import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function notifyUser(userId: number, message: string) {
  return prisma.notification.create({
    data: { userId, message }
  });
} 