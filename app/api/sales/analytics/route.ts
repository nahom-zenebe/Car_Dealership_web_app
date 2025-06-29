import { NextResponse } from 'next/server';


import { PrismaClient } from '@/app/generated/prisma';
import { getSession } from '@/app/lib/session'; 

interface TopModelResult {
  carId: string;
  _count: {
    id: number;
  };
  car: {
    make: string;
    model: string;
  };
}
const prisma = new PrismaClient();
// Helper function to get date ranges
const getDateRange = (range: string = 'monthly') => {
  const now = new Date();
  let from, to;
  
  switch(range) {
    case 'weekly':
      from = new Date(now.setDate(now.getDate() - 7));
      to = new Date();
      break;
    case 'yearly':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date();
      break;
    case 'monthly':
    default:
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date();
      break;
  }
  
  return { from, to };
};

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || 'monthly';
    
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { from, to } = getDateRange(range as string);

    // Get sales data grouped by month
    const salesData = await prisma.sale.groupBy({
      by: ['saleDate'],
      where: {
        buyerId: currentUser.user.id,
        saleDate: {
          gte: from,
          lte: to
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

    // Get top models (groupBy does not support include)
    const topModelCounts = await prisma.saleItem.groupBy({
      by: ['carId'],
      where: {
        sale: {
          buyerId: currentUser.user.id,
          saleDate: {
            gte: from,
            lte: to
          }
        }
      },
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const carIdsRaw = topModelCounts.map(item => item.carId);
    const carIds = carIdsRaw.filter((id): id is string => id !== null);
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, make: true, model: true }
    });
    const formattedTopModels = topModelCounts.map(item => {
      const car = cars.find(c => c.id === item.carId);
      return {
        model: car ? `${car.make} ${car.model}` : 'Unknown',
        count: item._count.id
      };
    });

    // Format the data for charts
    const formattedData = salesData.map(sale => ({
      month: sale.saleDate.toLocaleString('default', { month: 'short' }),
      count: sale._count.id,
      revenue: sale._sum.price || 0
    }));

    return NextResponse.json({
      salesData: formattedData,
      topModels: formattedTopModels,
      totalPurchases: salesData.reduce((sum, item) => sum + item._count.id, 0),
      totalRevenue: salesData.reduce((sum, item) => sum + (item._sum.price || 0), 0)
    });

  } catch (error) {
    console.error('[ANALYTICS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}