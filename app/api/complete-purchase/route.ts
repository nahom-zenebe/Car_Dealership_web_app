import { NextResponse } from 'next/server';
import { PrismaClient } from '@/app/generated/prisma';
import { getSession } from '@/app/lib/session';
import Stripe from 'stripe';

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {

});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const {
      items,
      paymentType,
      deliveryAddress,
      paymentIntentId,
      savePaymentMethod,
    } = await request.json();

    // Validate input
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    if (!paymentType || !deliveryAddress) {
      return NextResponse.json(
        { error: 'Payment type and delivery address are required' },
        { status: 400 }
      );
    }

    // Verify payment intent
    let paymentIntent;
    if (paymentIntentId) {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      if (paymentIntent.status !== 'succeeded') {
        return NextResponse.json(
          { error: 'Payment not completed' },
          { status: 400 }
        );
      }
    }

    // Create sale
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
            quantity: item.quantity,
          })),
        },
      },
      include: {
        items: true,
      },
    });

    // Update car stock status
    await Promise.all(
      items.map(async (item: any) => {
        await prisma.car.update({
          where: { id: item.carId },
          data: { inStock: false },
        });
      })
    );

    // Save payment method if requested
    if (savePaymentMethod && paymentIntentId && paymentType === 'CreditCard') {
      const paymentMethod = await stripe.paymentMethods.retrieve(
        paymentIntent!.payment_method as string
      );

      await prisma.paymentMethod.create({
        data: {
          userId: session.user.id,
          type: 'CreditCard',
          cardNumber: paymentMethod.card?.last4 || '',
          cardExpiry: `${paymentMethod.card?.exp_month}/${paymentMethod.card?.exp_year}`,
          cardName: paymentMethod.billing_details?.name || '',
          isDefault: true, // Set as default for now
        },
      });
    }

    return NextResponse.json(sale);
  } catch (error: any) {
    console.error('Error completing purchase:', error);
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}