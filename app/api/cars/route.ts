import { NextResponse } from "next/server";
import { createcars } from "@/app/actions/carActions";


export async function POST(req:Request) {
    try{
        const body = await req.json()
        const newCar=await createcars(body);
        return NextResponse.json(newCar, { status: 201 })
    }
    catch(error){
        return NextResponse.json({ error: 'Failed to create car' }, { status: 500 })
    }
    }
    
