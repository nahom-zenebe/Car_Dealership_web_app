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
    const topModels = await prisma.saleItem.groupBy({
      by: ['carId'],
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5,
      include: {
        car: {
          select: {
            make: true,
            model: true
          }
        }
      }
    });

    // Get top buyers
    const topBuyers = await prisma.sale.groupBy({
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
      take: 5,
      include: {
        buyer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    });

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