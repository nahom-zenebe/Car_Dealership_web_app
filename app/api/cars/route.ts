import { NextResponse } from "next/server";
import { createcars, getcars } from "@/app/actions/carActions";

export async function GET() {
    try {
        const cars = await getcars();
        return NextResponse.json(cars, { status: 200 });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const newCar = await createcars(body);
        return NextResponse.json(newCar, { status: 201 });
    } catch (error) {
        console.error('POST error:', error);
        return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
    }
}
