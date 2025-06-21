import { NextRequest, NextResponse} from 'next/server';
import {  PrismaClient } from '@/app/generated/prisma';

import { uploadToCloudinary } from '@/app/lib/cloundinary';

const prisma = new PrismaClient();

export async function POST(req:NextRequest,{params}:{params:{userId:string}}){

    try{
        const{userId}=params;
        const formData=await req.formData()


        const frontId=formData.get('fontId')as File;
        const backId=formData.get('backId')as File|null;


        if (! frontId){
            return new NextResponse('Front ID is required', { status: 400 });
        }
        const frontIdUrl = await uploadToCloudinary(
            frontId, 
            `verification/${userId}`
          );
          const backIdUrl = backId 
      ? await uploadToCloudinary(backId, `verification/${userId}`)
      : null;

      const user=await prisma.user.update({
        where:{id:userId},
        data:{
            governmentIdFrontUrl: frontIdUrl,
            governmentIdBackUrl:backIdUrl,
            verificationStatus:'pending'
        }
,
      })

      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          verificationStatus: user.verificationStatus
        }
      });


    }
    catch(error){
        console.error('[VERIFICATION_ERROR]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }
}