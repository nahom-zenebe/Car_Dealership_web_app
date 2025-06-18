import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';


const prisma = new PrismaClient();

// Enhanced validation schema for sale creation
const saleSchema = z.object({
  carId: z.string(),
  buyerId: z.string(),
  price: z.number().positive(),
  paymentType: z.enum(['CreditCard', 'BankTransfer', 'Financing']),
  deliveryAddress: z.string().min(10),
  deliveryDate: z.string().datetime().optional(),
  warrantyIncluded: z.boolean().optional().default(false),
  premiumPaint: z.boolean().optional().default(false),
  status: z.enum(['pending', 'completed', 'cancelled', 'delivered']).optional().default('completed'),
});

// GET /api/sales
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const carId = searchParams.get('carId');
    const status = searchParams.get('status') ;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = {};
    if (buyerId) where.buyerId = buyerId;
    if (carId) where.carId = carId;
    if (status) where.status = status;
    if (startDate || endDate) {
      where.saleDate = {};
      if (startDate) where.saleDate.gte = new Date(startDate);
      if (endDate) where.saleDate.lte = new Date(endDate);
    }

    const [sales, total] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          car: {
            select: {
              make: true,
              model: true,
              year: true,
              imageUrls: true
            }
          },
          buyer: {
            select: {
              name: true,
              email: true
            }
          }
        },
        orderBy: { saleDate: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.sale.count({ where })
    ]);

    return NextResponse.json({
      data: sales,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching sales:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sales', details: error instanceof Error ? error.message : null },
      { status: 500 }
    );
  }
}

// POST /api/sales - Create a new sale (checkout completion)
export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = saleSchema.parse(body);

    // Calculate final price including optional features
    const car = await prisma.car.findUnique({
      where: { id: validatedData.carId },
      select: { price: true, warrantyPrice: true, paintPrice: true }
    });

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      );
    }

    let finalPrice = validatedData.price;
    if (validatedData.warrantyIncluded && car.warrantyPrice) {
      finalPrice += car.warrantyPrice;
    }
    if (validatedData.premiumPaint && car.paintPrice) {
      finalPrice += car.paintPrice;
    }

    // Start a transaction for atomic operations
    const sale = await prisma.$transaction(async (tx) => {
      // Create the sale record
      const newSale = await tx.sale.create({
        data: {
          carId: validatedData.carId,
          buyerId: validatedData.buyerId,
          price: finalPrice,
          paymentType: validatedData.paymentType ,
          status: validatedData.status,
          deliveryAddress: validatedData.deliveryAddress,
          deliveryDate: validatedData.deliveryDate ? new Date(validatedData.deliveryDate) : null,
          saleDate: new Date(),
        },
        include: {
          car: {
            select: {
              make: true,
              model: true,
              imageUrls: true
            }
          },
          buyer: {
            select: {
              name: true,
              email: true
            }
          }
        }
      });

      // Update car availability
      await tx.car.update({
        where: { id: validatedData.carId },
        data: { inStock: false },
      });

      // If this was a credit card payment, save it if not already saved
      if (validatedData.paymentType === 'CreditCard') {
        const existingMethod = await tx.paymentMethod.findFirst({
          where: {
            userId: validatedData.buyerId,
            type: 'CreditCard',
            isDefault: true
          }
        });

        if (!existingMethod) {
          await tx.paymentMethod.create({
            data: {
              userId: validatedData.buyerId,
              type: 'CreditCard',
              isDefault: true,
              // Note: In a real app, you'd store encrypted payment info
              cardNumber: '•••• •••• •••• ••••', // Last 4 digits only
              cardName: 'Primary Card'
            }
          });
        }
      }

      return newSale;
    });

    return NextResponse.json(sale, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Error creating sale:', error);
    return NextResponse.json(
      { 
        error: 'Failed to complete purchase',
        details: error instanceof Error ? error.message : null 
      },
      { status: 500 }
    );
  }
}