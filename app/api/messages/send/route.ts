import { PrismaClient} from '../../../generated/prisma';
import { NextResponse } from 'next/server';
import { Server } from 'socket.io';



const prisma = new PrismaClient();

export async function POST(req:Request){
    const{content,receiverId}=await req.json();


    const message=await prisma.message.create({
        data:{
            content,
            receiver:receiverId,
            sender:"admin"
        }
    })
    const io = globalThis.io as Server;
  io.to(receiverId).emit("new_message", message);

  return NextResponse.json(message);
}