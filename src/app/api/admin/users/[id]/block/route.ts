import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAuth } from "../../../../auth-middleware";

const prisma = new PrismaClient();

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Verify admin authentication
    const decoded = verifyAuth(request);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { blocked } = await request.json();
    const userId = parseInt(id);

    if (typeof blocked !== "boolean") {
      return NextResponse.json({ error: "Blocked status must be a boolean" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Prevent admin from blocking themselves
    if (user.id === decoded.userId) {
      return NextResponse.json({ error: "Cannot block your own account" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { blocked },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        blocked: true,
        createdAt: true,
        phone: true,
        whatsapp: true
      }
    });

    return NextResponse.json({ 
      message: `User ${blocked ? 'blocked' : 'unblocked'} successfully`,
      user: updatedUser 
    });

  } catch (error) {
    console.error("Error updating user block status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 