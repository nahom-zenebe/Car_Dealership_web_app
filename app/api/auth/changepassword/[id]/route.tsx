


import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';


export async function UPDATE(
  request: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const { id } = context.params;
    const { password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'User ID and password are required' }, { status: 400 });
    }

    // Hash the password securely
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update the user's password
    const user = await prisma.user.update({
      where: { id },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Error updating password:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
