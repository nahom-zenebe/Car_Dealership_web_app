import { CardDescription } from '@/components/ui/card';
import { NextRequest, NextResponse } from 'next/server';
import {  PrismaClient } from '../../../generated/prisma';


const prisma = new PrismaClient();
export async function GET(req:NextRequest) {
    try{
    
      const cars=await prisma.car.count();
      if (!CardDescription) {
        return NextResponse.json({ error: 'cars is  not found' }, { status: 404 });
      }
      
      return  NextResponse.json({ total: cars });
  
    }
    catch(err){
      console.error('Error fetching cars:', err);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
    
  }