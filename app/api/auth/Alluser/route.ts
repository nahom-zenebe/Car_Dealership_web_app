import { NextRequest, NextResponse } from 'next/server';
import {  PrismaClient } from '../../../generated/prisma';


const prisma = new PrismaClient();
export async function GET(req:NextRequest) {
    try{
    
      const user=await prisma.user.count();
      if (!user) {
        return NextResponse.json({ error: 'user is  not found' }, { status: 404 });
      }
      
      return  NextResponse.json({ total: user });
  
    }
    catch(err){
      console.error('Error fetching car:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    
  }