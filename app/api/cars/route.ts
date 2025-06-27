import { NextResponse } from 'next/server';
import { FuelType, PrismaClient, Transmission } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Zod enums
const fuelTypeEnum = z.nativeEnum(FuelType);
const transmissionEnum = z.nativeEnum(Transmission);

// Zod schema for car validation
const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().min(0),
  mileage: z.number().int().min(0).optional(),
  color: z.string().min(1).optional(),
  inStock: z.boolean().optional(),
  features: z.array(z.string().min(1)).optional(),
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  description: z.string().optional(),
  imageUrls: z.array(z.string().url()).min(1), // 👈 required and validated
});

export async function POST(req: Request) {
  try {
    // Parse incoming JSON request
    const body = await req.json();

    // Validate input
    const validatedData = carSchema.parse({
      ...body,
      year: Number(body.year),
      price: Number(body.price),
      mileage: body.mileage ? Number(body.mileage) : undefined,
    });

    // Save to DB
    const car = await prisma.car.create({
      data: validatedData,
    });

    return NextResponse.json(car, { status: 201 });

  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating car:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create car' }, 
      { status: 500 }
    );
  }
}

// GET handler remains the same...
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
    return NextResponse.json({ error: 'Failed to fetch cars' }, { status: 500 });
  }
}