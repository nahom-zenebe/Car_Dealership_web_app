import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getSession } from '@/app/lib/session'; 


const prisma = new PrismaClient();
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  
});
export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      buyerInfo,
      items,
      paymentType,
      deliveryAddress,
      paymentIntentId,
      saveInfo,
    } = await request.json();

    const sale = await prisma.sale.create({
      data: {
        buyerId: session.user.id,
        price: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
        paymentType,
        deliveryAddress,
        paymentIntentId,
        status: 'completed',
        paymentStatus: 'succeeded',
        items: {
          create: items.map((item: any) => ({
            carId: item.carId,
            price: item.price,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    await Promise.all(
      items.map(async (item: any) => {
        await prisma.car.update({
          where: { id: item.carId },
          data: { inStock: false },
        });
      })
    );

    if (saveInfo && paymentIntentId && paymentType === 'CreditCard') {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent.payment_method as string
      );

      await prisma.paymentMethod.create({
        data: {
          userId: session.user.id,
          type: 'CreditCard',
          cardNumber: paymentMethod.card?.last4 || '',
          cardExpiry: `${paymentMethod.card?.exp_month}/${paymentMethod.card?.exp_year}`,
          cardName: paymentMethod.billing_details?.name || '',
          isDefault: true,
        },
      });
    }

    return NextResponse.json(sale);
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 400 }
    );
  }
}



export async function GET(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get user profile with purchases and payment methods
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        address: true,
        profilePhotoUrl: true,
        isVerified: true,
        verificationStatus: true,
        createdAt: true,
        purchases: {
          select: {
            id: true,
            saleDate: true,
            price: true,
            paymentType: true,
            status: true,
            deliveryAddress: true,
            deliveryDate: true,
            paymentStatus: true,
            items: {
              select: {
                id: true,
                price: true,
                car: {
                  select: {
                    id: true,
                    make: true,
                    model: true,
                    year: true,
                    imageUrls: true
                  }
                }
              }
            }
          },
          orderBy: {
            saleDate: 'desc'
          }
        },
        savedPaymentMethods: {
          select: {
            id: true,
            type: true,
            cardNumber: true,
            cardExpiry: true,
            cardName: true,
            isDefault: true,
            bankName: true,
            accountNumber: true,
            routingNumber: true,
            createdAt: true
          },
          orderBy: {
            isDefault: 'desc'
          }
        },
        privacy: {
          select: {
            publicProfile: true,
            activityStatus: true,
            dataCollection: true
          }
        },
        theme: true,
        darkMode: true
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (err: any) {
    return NextResponse.json(
      { error: { message: err.message } },
      { status: 400 }
    );
  }
}