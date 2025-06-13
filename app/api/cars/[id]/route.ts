import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const car = await prisma.car.findUnique({
            where: { id: params.id }
        });
        
        if (!car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }
        
        return NextResponse.json(car, { status: 200 });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const updatedCar = await prisma.car.update({
            where: { id: params.id },
            data: body
        });
        return NextResponse.json(updatedCar, { status: 200 });
    } catch (error) {
        console.error('PUT error:', error);
        return NextResponse.json({ error: 'Failed to update car' }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.car.delete({
            where: { id: params.id }
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        console.error('DELETE error:', error);
        return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }
} 