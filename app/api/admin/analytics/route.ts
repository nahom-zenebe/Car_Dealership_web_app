import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getSession } from '@/app/lib/session'; 


const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const currentUser = await getSession();
    
    if (!currentUser || currentUser.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all sales data for admin (last 6 months)
    const salesData = await prisma.sale.groupBy({
      by: ['saleDate'],
      where: {
        saleDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      },
      _sum: { price: true },
      _count: { id: true },
      orderBy: { saleDate: 'asc' }
    });

    // Get total sales and revenue
    const totalSales = await prisma.sale.count({
      where: {
        saleDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    });
    const totalRevenue = await prisma.sale.aggregate({
      _sum: { price: true },
      where: {
        saleDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    });
    const uniqueBuyers = await prisma.sale.aggregate({
      _count: { buyerId: true },
      where: {
        saleDate: {
          gte: new Date(new Date().setMonth(new Date().getMonth() - 6))
        }
      }
    });

    // Get top selling models (groupBy does not support include)
    const topModelCounts = await prisma.saleItem.groupBy({
      by: ['carId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5,
    });
    const carIds = topModelCounts.map(item => item.carId).filter((id): id is string => !!id);
    const cars = await prisma.car.findMany({
      where: { id: { in: carIds } },
      select: { id: true, make: true, model: true }
    });
    const topModels = topModelCounts.map(item => {
      const car = cars.find(c => c.id === item.carId);
      return {
        model: car ? `${car.make} ${car.model}` : 'Unknown',
        count: item._count.id
      };
    });

    // Get top buyers (groupBy does not support include)
    const topBuyerCounts = await prisma.sale.groupBy({
      by: ['buyerId'],
      _sum: { price: true },
      _count: { id: true },
      orderBy: { _sum: { price: 'desc' } },
      take: 5,
    });
    const buyerIds = topBuyerCounts.map(item => item.buyerId);
    const buyers = await prisma.user.findMany({
      where: { id: { in: buyerIds } },
      select: { id: true, name: true, email: true }
    });
    const topBuyers = topBuyerCounts.map(item => {
      const buyer = buyers.find(b => b.id === item.buyerId);
      return {
        name: buyer ? buyer.name : 'Unknown',
        email: buyer ? buyer.email : '',
        totalSpent: item._sum.price || 0,
        purchases: item._count.id
      };
    });

    return NextResponse.json({
      salesData,
      topModels,
      topBuyers,
      totalSales,
      totalRevenue: totalRevenue._sum.price || 0,
      uniqueBuyers: uniqueBuyers._count.buyerId || 0
    });

  } catch (error) {
    console.error('[ADMIN_ANALYTICS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}