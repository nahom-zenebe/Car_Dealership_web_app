import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';
import Stripe from 'stripe';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {

});

export async function POST(request: Request) {
  const session = await getSession();

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Stripe is properly configured
  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Stripe is not properly configured. Please set STRIPE_SECRET_KEY environment variable.' },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    console.log('Complete purchase request body:', body);
    
    const {
      items,
      paymentType,
      customerInfo,
      paymentIntentId,
      savePaymentMethod,
    } = body;

    // Validate input
    if (!items || !Array.isArray(items)) {
      return NextResponse.json({ error: 'Invalid items' }, { status: 400 });
    }

    if (!paymentType || !customerInfo) {
      return NextResponse.json(
        { error: 'Payment type and customer information are required' },
        { status: 400 }
      );
    }

    console.log('Creating sale with data:', {
      buyerId: session.user.id,
      price: items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0),
      paymentType,
      deliveryAddress: customerInfo.address,
      itemsCount: items.length
    });

    // Verify payment intent
    let paymentIntent;
    if (paymentIntentId) {
      try {
        paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
        if (paymentIntent.status !== 'succeeded') {
          return NextResponse.json(
            { error: 'Payment not completed' },
            { status: 400 }
          );
        }
      } catch (stripeError) {
        console.error('Stripe payment intent verification failed:', stripeError);
        return NextResponse.json(
          { error: 'Payment verification failed' },
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
        deliveryAddress: customerInfo.address,
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

    console.log('Sale created successfully:', sale.id);

    // Update car stock status
    await Promise.all(
      items.map(async (item: any) => {
        await prisma.car.update({
          where: { id: item.carId },
          data: { inStock: false },
        });
      })
    );

    console.log('Car stock updated successfully');

    // Save payment method if requested
    if (savePaymentMethod && paymentIntentId && paymentType === 'CreditCard') {
      try {
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
        console.log('Payment method saved successfully');
      } catch (paymentMethodError) {
        console.error('Failed to save payment method:', paymentMethodError);
        // Don't fail the entire purchase if payment method saving fails
      }
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