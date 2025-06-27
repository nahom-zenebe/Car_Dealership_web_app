

import { NextResponse } from 'next/server';


import { PrismaClient } from '@/app/generated/prisma';
import { getSession } from '@/app/lib/session';

const prisma = new PrismaClient();
export async function POST(request: Request) {
  try {
    const currentUser = await getSession();
    if (!currentUser) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { phone, address } = await request.json();
    
    if (!phone || !address) {
      return new NextResponse('Phone and address are required', { status: 400 });
    }

    // Update user with phone and address
    await prisma.user.update({
      where: { id: currentUser.user.id },
      data: { phone, address }
    });

    // Create verification request
    const verificationRequest = await prisma.verificationRequest.create({
      data: {
        userId: currentUser.user.id,
        phone,
        address,
        status: 'pending'
      }
    });

    // Update user verification status
    await prisma.user.update({
      where: { id: currentUser.user.id },
      data: { verificationStatus: 'pending' }
    });

    return NextResponse.json(verificationRequest);
  } catch (error) {
    console.error('[VERIFICATION_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}