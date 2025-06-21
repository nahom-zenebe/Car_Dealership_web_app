import { NextRequest, NextResponse} from 'next/server';
import {  PrismaClient } from '@/app/generated/prisma';

import { uploadToCloudinary } from '@/app/lib/cloundinary';

const prisma = new PrismaClient();


export async function  GET(req: NextRequest){
    try{
      
        const pendingVerifications=await prisma.user.findMany({
            where:{
                verificationStatus:'pending',
            },
            select: {
                id: true,
                name: true,
                email: true,
                governmentIdFrontUrl: true,
                governmentIdBackUrl: true,
                createdAt: true,
                verificationComments: true,
              },
              orderBy: {
                createdAt: 'asc',
              },

        })
        return NextResponse.json(pendingVerifications);
    }
    catch(error){
        console.error('[ADMIN_VERIFICATIONS_ERROR]', error);
        return new NextResponse('Internal Error', { status: 500 })
    }

}

