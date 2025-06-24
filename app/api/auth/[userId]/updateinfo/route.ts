
import { NextResponse } from "next/server"
import { PrismaClient } from '@/app/generated/prisma';


const prisma = new PrismaClient();
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params

  try {
    const body = await req.json()
    const { name, email, phone, address } = body

    const existingUser = await prisma.user.findUnique({ where: { id } })
    if (!existingUser) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
      },
    })

    return NextResponse.json(updatedUser, { status: 200 })
  } catch (error) {
    console.error("[UPDATE_USER_INFO_ERROR]", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
