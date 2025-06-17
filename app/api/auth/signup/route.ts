import { NextResponse } from 'next/server';
import { FuelType, PrismaClient, Transmission } from '../../../generated/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET|| "default secret key"; 
const userSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  phone: z.string().optional(),
  address: z.string().optional(),
  role: z.enum(['buyer', 'seller']),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, phone, address, role } = userSchema.parse(body);

const salt=await bcrypt.genSalt(10);
const hashedpassword=await bcrypt.hash(password,salt);

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash: hashedpassword, // Replace with hashed password
        phone,
        role,
      },
    });
    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );
    const response = NextResponse.json(
      { message: 'User created', user: { id: newUser.id, email: newUser.email, role: newUser.role } },
      { status: 201 }
    );  
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    return response;

  } catch (error:any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid input', details: error.errors }, { status: 400 });
    }

    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
    }

    console.error('User creation error:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
