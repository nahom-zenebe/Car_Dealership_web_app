import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { prisma } from '@/app/lib/prisma';
import { getSession } from '@/app/lib/session';

// Check if Stripe secret key is available
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-05-28.basil', 
});

type Session = {
  user: {
    id: string;
    email: string;
    role: string;
  };
};

export async function POST(request: Request) {
  const session = await getSession() as Session | null;

  if (!session) {
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
    const { carIds, paymentType, deliveryAddress } = await request.json();

    // ✅ Input validation
    if (!carIds || !Array.isArray(carIds)) {
      return NextResponse.json({ error: 'Invalid car IDs' }, { status: 400 });
    }

    if (!paymentType || !deliveryAddress) {
      return NextResponse.json({ error: 'Payment type and delivery address are required' }, { status: 400 });
    }

    // ✅ Fetch in-stock cars
    const cars = await prisma.car.findMany({
      where: {
        id: { in: carIds },
        inStock: true,
      },
    });

    if (cars.length !== carIds.length) {
      const missingCount = carIds.length - cars.length;
      return NextResponse.json(
        { error: `${missingCount} car(s) not found or not available` },
        { status: 404 }
      );
    }

    // ✅ Calculate total price and validate Stripe limits
    const totalPrice = cars.reduce((sum, car) => sum + car.price, 0);

    if (totalPrice > 999_999.99) {
      return NextResponse.json(
        { error: 'Total amount exceeds Stripe max of $999,999.99' },
        { status: 400 }
      );
    }

    // ✅ Create payment intent in Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalPrice * 100), // cents
      currency: 'usd',
      automatic_payment_methods: { enabled: true },
      metadata: {
        userId: session.user.id,
        carIds: JSON.stringify(carIds),
      },
    });

    // ✅ Create sale record in DB
    const sale = await prisma.sale.create({
      data: {
        buyerId: session.user.id,
        price: totalPrice,
        deliveryAddress,
        paymentType,
        paymentStatus: 'pending',
        status: 'pending',
        paymentIntentId: paymentIntent.id,
        items: {
          create: cars.map((car) => ({
            carId: car.id,
            price: car.price,
          })),
        },
      },
    });

    // ✅ Respond with clientSecret
    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      saleId: sale.id,
    });

  } catch (error: any) {
    console.error('Error creating payment intent:', error);

    // ✅ Provide Stripe-specific error info if possible
    if (error.type === 'StripeInvalidRequestError') {
      return NextResponse.json({ error: `Stripe error: ${error.message}` }, { status: 400 });
    }

    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
