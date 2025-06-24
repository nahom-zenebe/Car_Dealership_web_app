import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const prisma = new PrismaClient();


const saleSchema = z.object({
  buyerInfo: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(10),
    address: z.string().min(10),
    deliveryNotes: z.string().optional(),
  }),
  items: z.array(
    z.object({
      carId: z.string(),
      price: z.number().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
  paymentType: z.enum(['CreditCard', 'BankTransfer', 'Financing']),
  paymentIntentId: z.string().optional(),
  saveInfo: z.boolean().optional(),
});

export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = saleSchema.parse(body);

    // Check car availability
    const carIds = validatedData.items.map(item => item.carId);
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, inStock: true, price: true }
    });

    if (cars.length !== carIds.length) {
      return NextResponse.json({ error: 'One or more cars not found' }, { status: 404 });
    }

    const unavailableCars = cars.filter(car => !car.inStock);
    if (unavailableCars.length > 0) {
      return NextResponse.json({ error: 'Some cars are no longer available' }, { status: 400 });
    }

    // Check if user exists or create new one
    let user = await prisma.user.findUnique({
      where: { email: validatedData.buyerInfo.email }
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: `${validatedData.buyerInfo.firstName} ${validatedData.buyerInfo.lastName}`,
          email: validatedData.buyerInfo.email,
          phone: validatedData.buyerInfo.phone,
          address: validatedData.buyerInfo.address,
          role: 'buyer',
          passwordHash: '', // You might want to handle this differently
          isVerified: false,
        }
      });
    } else if (validatedData.saveInfo) {
      // Update user info if they want to save it
      await prisma.user.update({
        where: { id: user.id },
        data: {
          phone: validatedData.buyerInfo.phone,
          address: validatedData.buyerInfo.address,
        }
      });
    }

    // Create sale transaction
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          buyerId: user!.id,
          price: validatedData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          paymentType: validatedData.paymentType,
          status: 'completed',
          deliveryAddress: validatedData.buyerInfo.address,
          paymentIntentId: validatedData.paymentIntentId,
          saleDate: new Date(),
        }
      });

      // Create sale items
      await Promise.all(
        validatedData.items.map(item =>
          tx.saleItem.create({
            data: {
              saleId: newSale.id,
              carId: item.carId,
              price: item.price,
              quantity: item.quantity,
            }
          })
        )
      );

      // Mark cars as sold
      await tx.car.updateMany({
        where: { id: { in: carIds } },
        data: { inStock: false }
      });

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
      { error: 'Failed to complete purchase' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const where = {};
    if (buyerId) where.buyerId = buyerId;
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
          buyer: { select: { name: true, email: true } },
          items: {
            include: {
              car: { select: { make: true, model: true, year: true, imageUrls: true } }
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