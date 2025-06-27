import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const { name, address, idType, idFront, idBack, userId } = await req.json();
  const verification = await prisma.verificationRequest.create({
    data: {
      name,
      address,
      idType,
      idFrontUrl: idFront,
      idBackUrl: idBack,
      status: 'pending',
      userId,
    },
  });
  return NextResponse.json({ success: true, verification });
} 