import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

import {  PrismaClient } from '../../../../generated/prisma';
const prisma = new PrismaClient();

export async function DELETE(req: NextRequest) {
    try {
      // Extract id from the URL
      const url = new URL(req.url);
      const parts = url.pathname.split('/');
      const id = parts[parts.length - 1];
      const user = await prisma.user.delete({
        where: { id }
      });
      if (!user) {
        return NextResponse.json({ error: 'user not found' }, { status: 404 });
      }
      const response = NextResponse.json({ message: 'Logged out successfully' });
      response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
    } catch (err) {
      console.error('Error deleting user:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }