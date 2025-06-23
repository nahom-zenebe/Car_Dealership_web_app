


import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';


import {  PrismaClient } from '../../../../generated/prisma';
const prisma = new PrismaClient();


export async function DELETE(req:NextRequest,context: { params: { id: string } }) {
    try{
      const {id}=context.params;
      const user=await prisma.user.delete({
        where:{id}
      })
      if (!user) {
        return NextResponse.json({ error: 'user not found' }, { status: 404 });
      }
      const response = NextResponse.json({ message: 'Logged out successfully' });
      response.cookies.set('token', '', {
        httpOnly: true,
        expires: new Date(0),
      });
      return response;
  
    }
    catch(err){
      console.error('Error fetching car:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    
  }