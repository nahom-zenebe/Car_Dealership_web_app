import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import {  PrismaClient } from '../../../../generated/prisma';


const prisma = new PrismaClient();
export async function PATCH(request: NextRequest) {
  try {
    const id = request.nextUrl.pathname.split('/')[5];
    const { password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'User ID and password are required' }, { status: 400 });
    }
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    const user = await prisma.user.update({
      where: { id },
      data: {
        passwordHash: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  }  catch (err: any) {
    console.error('Error updating password:', err.message, err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
