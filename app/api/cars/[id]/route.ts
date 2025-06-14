import { NextResponse } from "next/server";
import { PrismaClient } from '../../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for car update
const carUpdateSchema = z.object({
  make: z.string().min(1).optional(),
  model: z.string().min(1).optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: z.number().positive().optional(),
  mileage: z.number().int().min(0).optional(),
  color: z.string().min(1).optional(),
  inStock: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

export async function GET(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const car = await prisma.car.findUnique({
            where: { id: params.id },
            include: {
                sales: {
                    include: {
                        customer: true,
                        seller: true,
                    },
                },
                appointments: {
                    include: {
                        customer: true,
                    },
                },
            },
        });
        
        if (!car) {
            return NextResponse.json({ error: 'Car not found' }, { status: 404 });
        }
        
        return NextResponse.json(car, { status: 200 });
    } catch (error) {
        console.error('Error fetching car:', error);
        return NextResponse.json({ error: 'Failed to fetch car' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: { id: string } }
) {
    try {
        const body = await request.json();
        const validatedData = carUpdateSchema.parse(body);

        const car = await prisma.car.update({
            where: { id: params.id },
            data: validatedData,
        });
        return NextResponse.json(car, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { error: 'Invalid input data', details: error.errors },
                { status: 400 }
            );
        }

        

        console.error('Error updating car:', error);
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
        

        console.error('Error deleting car:', error);
        return NextResponse.json({ error: 'Failed to delete car' }, { status: 500 });
    }
} 