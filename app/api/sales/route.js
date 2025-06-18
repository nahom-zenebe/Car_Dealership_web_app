import { NextResponse } from 'next/server';
import { PrismaClient } from '../../generated/prisma';
import { z } from 'zod';

const prisma = new PrismaClient();


const saleSchema = z.object({
  buyerId: z.string(),
  items: z.array(
    z.object({
      carId: z.string(),
      price: z.number().positive(),
    })
  ).min(1),
  paymentType: z.enum(['CreditCard', 'BankTransfer', 'Financing']),
  deliveryAddress: z.string().min(10),
  deliveryDate: z.string().datetime().optional(),
  warrantyIncluded: z.boolean().optional().default(false),
  premiumPaint: z.boolean().optional().default(false),
  status: z.enum(['pending', 'completed', 'cancelled', 'delivered']).optional().default('completed'),
});


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

// 🟡 POST /api/sales — create sale with multiple SaleItem records
export async function POST(request) {
  try {
    const body = await request.json();
    const validatedData = saleSchema.parse(body);

    // Fetch all cars involved in the sale to validate and enrich data
    const carIds = validatedData.items.map(item => item.carId);
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, inStock: true }
    });

    if (cars.length !== carIds.length) {
      return NextResponse.json({ error: 'One or more cars not found' }, { status: 404 });
    }

    const unavailableCars = cars.filter(car => !car.inStock);
    if (unavailableCars.length > 0) {
      return NextResponse.json({ error: 'Some cars are no longer available' }, { status: 400 });
    }

    // 🔐 Start a transaction for the whole purchase process
    const sale = await prisma.$transaction(async (tx) => {
      const newSale = await tx.sale.create({
        data: {
          buyerId: validatedData.buyerId,
          price: validatedData.items.reduce((sum, item) => sum + item.price, 0),
          paymentType: validatedData.paymentType,
          status: validatedData.status,
          deliveryAddress: validatedData.deliveryAddress,
          deliveryDate: validatedData.deliveryDate ? new Date(validatedData.deliveryDate) : null,
          saleDate: new Date(),
        }
      });

      // 📦 Create SaleItem records
      await Promise.all(
        validatedData.items.map(item =>
          tx.saleItem.create({
            data: {
              saleId: newSale.id,
              carId: item.carId,
              price: item.price,
            }
          })
        )
      );

      // 🔄 Mark all cars as sold (not in stock)
      await tx.car.updateMany({
        where: { id: { in: carIds } },
        data: { inStock: false }
      });

      // 💳 Optionally store credit card if it's a CC payment
      if (validatedData.paymentType === 'CreditCard') {
        const exists = await tx.paymentMethod.findFirst({
          where: {
            userId: validatedData.buyerId,
            type: 'CreditCard',
            isDefault: true
          }
        });

        if (!exists) {
          await tx.paymentMethod.create({
            data: {
              userId: validatedData.buyerId,
              type: 'CreditCard',
              isDefault: true,
              cardNumber: '•••• •••• •••• ••••',
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
