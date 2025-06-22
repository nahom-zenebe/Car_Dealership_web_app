import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { uploadBase64ToCloudinary } from '@/app/lib/cloundinary';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const userId = req.nextUrl.pathname.split('/')[4];
    const body = await req.json();

    const { frontIdBase64, backIdBase64 } = body;

    if (!frontIdBase64) {
      return new NextResponse('Front ID image is required', { status: 400 });
    }

    const frontIdUrl = await uploadBase64ToCloudinary(frontIdBase64, `verification/${userId}`);
    const backIdUrl = backIdBase64
      ? await uploadBase64ToCloudinary(backIdBase64, `verification/${userId}`)
      : null;

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        governmentIdFrontUrl: frontIdUrl,
        governmentIdBackUrl: backIdUrl,
        verificationStatus: 'pending',
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        verificationStatus: user.verificationStatus,
      },
    });
  } catch (error) {
    console.error('[VERIFICATION_ERROR]', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
