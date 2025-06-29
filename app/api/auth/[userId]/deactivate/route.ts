import { NextRequest, NextResponse } from 'next/server';
import {  PrismaClient } from '../../../../generated/prisma';

const prisma = new PrismaClient();

export async function PATCH(req: Request) {
    const userId = req.url.split('/')[4]; // Extract userId from URL
  
    try {
      // Check if user exists
      const user = await prisma.user.findUnique({
        where: { id: userId },
      });
  
      if (!user) {
        return NextResponse.json({ message: "User not found" }, { status: 404 });
      }
  
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isActive: false },
      });
  
      return NextResponse.json(
        { message: "Account deactivated", user: updatedUser },
        { status: 200 }
      );
    } catch (error) {
      console.error("Deactivate Error:", error);
      return NextResponse.json(
        { message: "Internal server error" },
        { status: 500 }
      );
    }
  }
  