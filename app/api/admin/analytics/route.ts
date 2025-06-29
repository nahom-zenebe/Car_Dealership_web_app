import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getSession } from '@/app/lib/session'; 

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || currentUser.user.role !== 'seller') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sales data for admin
    const salesData = await prisma.sale.groupBy({
      by: ['saleDate'],
      where: {
        saleDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      },
      _sum: {
        price: true
      },
      _count: {
        id: true
      },
      orderBy: {
        saleDate: 'asc'
      }
    });

    // Get top selling models across all users
    const topModelsRaw = await prisma.saleItem.groupBy({
      by: ['carId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    });

    const topModels = await Promise.all(
      topModelsRaw
        .filter((item) => item.carId !== null)
        .map(async (item) => {
          const car = await prisma.car.findUnique({
            where: { id: item.carId as string },
            select: { make: true, model: true }
          });
          return { ...item, car };
        })
    );

    // Get top buyers
    const topBuyersRaw = await prisma.sale.groupBy({
      by: ['buyerId'],
      _sum: {
        price: true
      },
      _count: {
        id: true
      },
      orderBy: {
        _sum: {
          price: 'desc'
        }
      },
      take: 5
    });

    const topBuyers = await Promise.all(
      topBuyersRaw
        .filter((item) => item.buyerId !== null)
        .map(async (item) => {
          const buyer = await prisma.user.findUnique({
            where: { id: item.buyerId as string },
            select: { name: true, email: true }
          });
          return { ...item, buyer };
        })
    );

    return NextResponse.json({
      salesData,
      topModels,
      topBuyers
    });

  } catch (error) {
    console.error('[ADMIN_ANALYTICS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}