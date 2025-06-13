import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Validation schema for car creation
const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive(),
  mileage: z.number().int().min(0),
  color: z.string().min(1),
  inStock: z.boolean().optional(),
  imageUrl: z.string().url().optional(),
});

// GET /api/cars
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const make = searchParams.get('make');
    const model = searchParams.get('model');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const inStock = searchParams.get('inStock');

    const where: any = {};
    if (make) where.make = { contains: make, mode: 'insensitive' };
    if (model) where.model = { contains: model, mode: 'insensitive' };
    if (inStock) where.inStock = inStock === 'true';
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    const cars = await prisma.car.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(cars);
  } catch (error) {
    console.error('Error fetching cars:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cars' },
      { status: 500 }
    );
  }
}

// POST /api/cars
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validate the request body
    const validatedData = carSchema.parse(body);
    
    const car = await prisma.car.create({
      data: validatedData,
    });

    return NextResponse.json(car, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }
    
    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: 'Failed to create car' },
      { status: 500 }
    );
  }
}
