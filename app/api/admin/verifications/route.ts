import { NextRequest, NextResponse } from 'next/server';

import { getSession } from '@/app/lib/session'; 
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();
// GET all pending verification requests

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || currentUser.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const verificationRequests = await prisma.verificationRequest.findMany({
      where: { status: 'pending' },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            phone: true,
            address:true,
            profilePhotoUrl: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(verificationRequests);
  } catch (error) {
    console.error('[ADMIN_VERIFICATIONS_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
// POST to approve/reject a verification request
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || currentUser.user.role !== 'admin') {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const { userId, approved, comments } = await request.json();

    // Update verification request
    const updatedRequest = await prisma.verificationRequest.update({
      where: { userId },
      data: { 
        status: approved ? 'approved' : 'rejected',
        comments,
        updatedAt: new Date()
      }
    });

    // Update user verification status
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        verificationStatus: approved ? 'approved' : 'rejected',
        verifiedAt: approved ? new Date() : null,
        verifiedByAdminId: currentUser.user.id,
        verificationComments: comments || null,
        isVerified: approved
      }
    });

    return NextResponse.json({
      success: true,
      request: updatedRequest,
      user: {
        id: user.id,
        name: user.name,
        verificationStatus: user.verificationStatus
      }
    });

  } catch (error) {
    console.error('[ADMIN_VERIFICATION_DECISION_ERROR]', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
