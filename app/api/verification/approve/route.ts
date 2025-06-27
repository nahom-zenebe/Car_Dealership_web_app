import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { id } = await req.json();
  const updated = await prisma.verificationRequest.update({
    where: { id },
    data: { status: 'approved' },
  });
  return NextResponse.json({ success: true, updated });
} 