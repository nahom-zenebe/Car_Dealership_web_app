

import { NextRequest, NextResponse } from 'next/server';

export async function GET(req:NextRequest) {
    try{
    
      const user=await prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
      });
      if (!user) {
        return NextResponse.json({ error: 'user is  not found' }, { status: 404 });
      }
      
      return  NextResponse.json(user);
  
    }
    catch(err){
      console.error('Error fetching car:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    
  }