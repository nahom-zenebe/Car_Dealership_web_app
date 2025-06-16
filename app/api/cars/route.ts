import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();

// Fuel type enum
const fuelTypeEnum = z.enum(['Petrol', 'Diesel', 'Electric']);
const transmissionEnum=z.enum(['Automatic','Manual','SemiAutomatic'])
// Zod schema
const carSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive(),
  mileage: z.number().int().min(0).optional(),
  color: z.string().min(1).optional(),
  inStock: z.boolean().optional(),
  features: z.array(z.string().min(1)).optional(),
  fuelType: fuelTypeEnum,
  transmission: transmissionEnum,
  imageUrl: z.string().url().optional(),
});

// 🚀 GET /api/cars
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

// 🚗 POST /api/cars
export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate body
    const validatedData = carSchema.parse(body);

    const {
      make,
      model,
      year,
      price,
      mileage,
      color,
      inStock,
      imageUrl,
      features,
      fuelType,
    } = validatedData;

    // Create car
    const car = await prisma.car.create({
      data: {
        make,
        model,
        year,
        price,
        fuelType,
        ...(mileage !== undefined && { mileage }),
        ...(color && { color }),
        ...(inStock !== undefined && { inStock }),
        ...(features && { features }),
        ...(imageUrl && { imageUrl }),
      },
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
    return NextResponse.json({ error: 'Failed to create car' }, { status: 500 });
  }
}
