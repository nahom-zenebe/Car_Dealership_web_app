import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET; 
// Validation schema for sale creation
const saleSchema = z.object({
  carId: z.string(),
  customerId: z.string(),
  sellerId: z.string(),
  price: z.number().positive(),
  saleDate: z.string().datetime().optional(),
});

// GET /api/sales
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get('customerId');
    const sellerId = searchParams.get('sellerId');
    const carId = searchParams.get('carId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const where: any = {};
    if (customerId) where.customerId = customerId;
    if (sellerId) where.sellerId = sellerId;
    if (carId) where.carId = carId;
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        car: true,


      },
      orderBy: { saleDate: 'desc' },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales' },
      { status: 500 }
    );
  }
}

// POST /api/sales
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = saleSchema.parse(body);

    // Start a transaction to ensure data consistency
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale
      const newSale = await tx.sale.create({
        data: {
          ...validatedData,
          saleDate: validatedData.saleDate ? new Date(validatedData.saleDate) : new Date(),
        },
        include: {
          car: true,
          

        },
      });

      // Update car's inStock status
      await tx.car.update({
        where: { id: validatedData.carId },
        data: { inStock: false },
      });

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating sale:', error);
    return NextResponse.json(
      { error: 'Failed to create sale' },
      { status: 500 }
    );
  }
} 