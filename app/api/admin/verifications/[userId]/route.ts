import { NextRequest, NextResponse} from 'next/server';
import {  PrismaClient } from '@/app/generated/prisma';


import { requireAdmin } from '@/app/lib/session';
const prisma = new PrismaClient();



export async function POST(request: NextRequest,{params}:{params:{userId:string}}){

    try{
        const session = await requireAdmin(request);
        const {userId}=params;



        const {approved,comments}=await request.json();

        const user=await prisma.user.update({
            where:{id:userId},
            data:{
                verificationStatus:approved?'approved':'rejected',
                verifiedAt:approved?  new Date() :null,
                verifiedByAdminId:session.user.id,
                verificationComments:comments||null
            }
        })
        return NextResponse.json({
            success: true,
            user: {
              id: user.id,
              verificationStatus: user.verificationStatus,
            },
          });


    }
    catch(error){
        console.error('[ADMIN_VERIFICATION_DECISION_ERROR]', error);
        return new NextResponse('Internal Error', { status: 500 });
    }


}