import { NextResponse } from "next/server"
import { PrismaClient } from '@/app/generated/prisma';


const prisma = new PrismaClient();


export async function  PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const { name, email, phone, address, profilePhotoUrl } = body;
 


    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone: phone || null,
        address: address || null,
        profilePhotoUrl: profilePhotoUrl || null
      }
    });

    return NextResponse.json(updatedUser);
    
  } catch (error:any) {
    console.error('[USER_UPDATE_ERROR]', error);
    return NextResponse.json(
      { error: "Internal server error", details: error.message },
      { status: 500 }
    );
  }
}