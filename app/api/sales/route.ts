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
