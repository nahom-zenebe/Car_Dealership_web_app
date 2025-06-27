import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
const prisma = new PrismaClient();

export async function GET() {
  const requests = await prisma.verificationRequest.findMany({
    where: { status: 'pending' },
    orderBy: { createdAt: 'desc' },
  });
  return NextResponse.json(requests);
} 